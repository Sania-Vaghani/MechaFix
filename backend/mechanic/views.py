from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import connection
import json
import jwt
from bson.objectid import ObjectId
import re
from dotenv import load_dotenv
import requests,os

load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY")

@csrf_exempt
def reverse_geocode(request):
    lat = request.GET.get("lat")
    lon = request.GET.get("lon")

    if not lat or not lon:
        return JsonResponse({"error": "lat and lon are required"}, status=400)

    try:
        url = "https://api.openrouteservice.org/geocode/reverse"
        params = {
            "api_key": os.getenv("ORS_API_KEY"),  # directly from .env
            "point.lat": lat,
            "point.lon": lon,
            "size": 1,
        }

        res = requests.get(url, params=params, timeout=10)
        data = res.json()

        if res.status_code == 200 and "features" in data and len(data["features"]) > 0:
            address = data["features"][0]["properties"]["label"]
            return JsonResponse({"address": address})
        else:
            return JsonResponse({"error": "No address found", "details": data}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def _auth_mechanic(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Bearer '):
        return None, JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None, JsonResponse({'error': 'Invalid token'}, status=401)
    if payload.get('user_type') != 'mechanic':
        return None, JsonResponse({'error': 'Only mechanics can manage workers'}, status=403)
    return payload.get('username'), None


def _get_db():
    return connection.cursor().db_conn


def _normalize_phone(phone: str) -> str:
    if not isinstance(phone, str):
        return ''
    # keep digits only
    digits = re.sub(r'\D', '', phone)
    return digits[-10:] if len(digits) >= 10 else digits


@csrf_exempt
def workers(request):
    username, error = _auth_mechanic(request)
    if error:
        return error

    db = _get_db()
    mech = db['auth_mech'].find_one({'username': username})
    if not mech:
        return JsonResponse({'error': 'Mechanic not found'}, status=404)
    garage_name = mech.get('garage_name')
    if not garage_name:
        return JsonResponse({'error': 'Garage name missing for mechanic'}, status=400)

    coll = db['mech_worker']
    # Ensure indexes (idempotent)
    try:
        coll.create_index('phone', unique=True)
        coll.create_index('garage_name')
        coll.create_index('garage_id')
    except Exception:
        pass

    if request.method == 'GET':
        items = []
        for doc in coll.find({'garage_name': garage_name}).sort('created_at', -1):
            doc['id'] = str(doc.pop('_id'))
            items.append(doc)
        return JsonResponse({'workers': items})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = (data.get('name') or '').strip()
            phone = _normalize_phone(data.get('phone') or '')
            if not name or not phone:
                return JsonResponse({'error': 'Name and phone are required'}, status=400)
            if len(phone) != 10:
                return JsonResponse({'error': 'Phone must be 10 digits'}, status=400)

            # Enforce unique phone globally across mech_worker
            if coll.find_one({'phone': phone}):
                return JsonResponse({'error': 'Phone already exists for another worker'}, status=409)

            doc = {
                'garage_name': garage_name,
                'garage_id': str(mech.get('_id')),
                'name': name,
                'phone': phone,
                'created_at': __import__('datetime').datetime.utcnow(),
            }
            coll.insert_one(doc)
            doc['id'] = str(doc.pop('_id'))
            return JsonResponse({'message': 'Worker added', 'worker': doc}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def worker_detail(request, worker_id: str):
    username, error = _auth_mechanic(request)
    if error:
        return error

    db = _get_db()
    mech = db['auth_mech'].find_one({'username': username})
    if not mech:
        return JsonResponse({'error': 'Mechanic not found'}, status=404)
    garage_name = mech.get('garage_name')
    if not garage_name:
        return JsonResponse({'error': 'Garage name missing for mechanic'}, status=400)

    coll = db['mech_worker']

    try:
        oid = ObjectId(worker_id)
    except Exception:
        return JsonResponse({'error': 'Invalid worker id'}, status=400)

    doc = coll.find_one({'_id': oid, 'garage_name': garage_name})
    if not doc:
        return JsonResponse({'error': 'Worker not found'}, status=404)

    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            update_fields = {}
            if 'name' in data:
                name = (data.get('name') or '').strip()
                if not name:
                    return JsonResponse({'error': 'Name cannot be empty'}, status=400)
                update_fields['name'] = name
            if 'phone' in data:
                phone = _normalize_phone(data.get('phone') or '')
                if len(phone) != 10:
                    return JsonResponse({'error': 'Phone must be 10 digits'}, status=400)
                # Ensure phone unique globally, excluding current doc
                exists = coll.find_one({'phone': phone, '_id': {'$ne': oid}})
                if exists:
                    return JsonResponse({'error': 'Phone already exists for another worker'}, status=409)
                update_fields['phone'] = phone

            if not update_fields:
                return JsonResponse({'error': 'No valid fields to update'}, status=400)

            coll.update_one({'_id': oid}, {'$set': update_fields})
            return JsonResponse({'message': 'Worker updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    if request.method == 'DELETE':
        coll.delete_one({'_id': oid})
        return JsonResponse({'message': 'Worker deleted'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def service_availability(request):
    username, error = _auth_mechanic(request)
    if error:
        return error

    db = _get_db()
    mech = db['auth_mech'].find_one({'username': username})
    if not mech:
        return JsonResponse({'error': 'Mechanic not found'}, status=404)
    garage_name = mech.get('garage_name')
    if not garage_name:
        return JsonResponse({'error': 'Garage name missing for mechanic'}, status=400)

    coll = db['service_availability']
    # Ensure indexes (idempotent)
    try:
        coll.create_index('garage_name', unique=True)
    except Exception:
        pass

    if request.method == 'GET':
        # Get existing service availability for this mechanic
        doc = coll.find_one({'garage_name': garage_name})
        if not doc:
            # Create default document for new user
            default_doc = {
                'garage_name': garage_name,
                'working_hours': {
                    'start_time': '07:00 AM',
                    'end_time': '10:00 PM'
                },
                'service_radius': 10,
                'services': [],  # Empty services array
                'created_at': __import__('datetime').datetime.utcnow(),
                'updated_at': __import__('datetime').datetime.utcnow()
            }
            
            # Insert the default document
            try:
                result = coll.insert_one(default_doc)
                default_doc['_id'] = result.inserted_id
                print(f"Created default service availability for {garage_name}: {default_doc}")
            except Exception as e:
                print(f"Error creating default document: {e}")
                # If insert fails, just return the default data without saving
                default_doc.pop('_id', None)
                return JsonResponse(default_doc)
            
            # Convert ObjectId to string for JSON serialization
            default_doc['id'] = str(default_doc.pop('_id'))
            return JsonResponse(default_doc)
        
        # Convert ObjectId to string for JSON serialization
        doc['id'] = str(doc.pop('_id'))
        return JsonResponse(doc)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Received data for {garage_name}: {data}")  # Debug log
            
            # Get existing data or use defaults
            existing_doc = coll.find_one({'garage_name': garage_name})
            print(f"Existing doc: {existing_doc}")  # Debug log
            
            if existing_doc:
                # Update existing record with new data, preserving unchanged fields
                update_data = {
                    'updated_at': __import__('datetime').datetime.utcnow()
                }
                
                # Handle working_hours - use provided data or preserve existing
                if 'working_hours' in data and data['working_hours']:
                    working_hours = data['working_hours']
                    if working_hours.get('start_time') and working_hours.get('end_time'):
                        update_data['working_hours'] = working_hours
                    else:
                        return JsonResponse({'error': 'Start time and end time are required for working hours'}, status=400)
                else:
                    # Preserve existing working hours
                    update_data['working_hours'] = existing_doc.get('working_hours', {
                        'start_time': '07:00 AM',
                        'end_time': '10:00 PM'
                    })
                
                # Handle service_radius - use provided data or preserve existing
                if 'service_radius' in data and data['service_radius'] is not None:
                    service_radius = data['service_radius']
                    if isinstance(service_radius, (int, float)) and service_radius > 0:
                        update_data['service_radius'] = service_radius
                    else:
                        return JsonResponse({'error': 'Valid service radius is required'}, status=400)
                else:
                    # Preserve existing service radius
                    update_data['service_radius'] = existing_doc.get('service_radius', 10)
                
                # Handle services - use provided data or preserve existing
                if 'services' in data:
                    services = data['services']
                    print(f"Services to update: {services}")  # Debug log
                    if isinstance(services, list):
                        # Validate each service if services array is not empty
                        if len(services) > 0:
                            for service in services:
                                if not service.get('name') or not service.get('price'):
                                    return JsonResponse({'error': 'Service name and price are required for all services'}, status=400)
                        update_data['services'] = services
                        print(f"Services updated in update_data: {update_data['services']}")  # Debug log
                    else:
                        return JsonResponse({'error': 'Services must be an array'}, status=400)
                else:
                    # Preserve existing services
                    update_data['services'] = existing_doc.get('services', [])
                
                print(f"Final update_data: {update_data}")  # Debug log
                
                # Update the document
                result = coll.update_one(
                    {'garage_name': garage_name},
                    {'$set': update_data}
                )
                print(f"Update result: {result.modified_count} documents modified")  # Debug log
                
                message = 'Service availability updated successfully'
                
            else:
                # Create new record with provided data and defaults (no default services)
                working_hours = data.get('working_hours', {
                    'start_time': '07:00 AM',
                    'end_time': '10:00 PM'
                })
                service_radius = data.get('service_radius', 10)
                services = data.get('services', [])  # Empty array by default
                
                # Validate required fields
                if not working_hours.get('start_time') or not working_hours.get('end_time'):
                    return JsonResponse({'error': 'Start time and end time are required'}, status=400)
                
                # Services can be empty array
                if not isinstance(services, list):
                    return JsonResponse({'error': 'Services must be an array'}, status=400)
                
                # Validate services if any are provided
                if len(services) > 0:
                    for service in services:
                        if not service.get('name') or not service.get('price'):
                            return JsonResponse({'error': 'Service name and price are required for all services'}, status=400)
                
                # Create new document
                doc = {
                    'garage_name': garage_name,
                    'working_hours': working_hours,
                    'service_radius': service_radius,
                    'services': services,
                    'created_at': __import__('datetime').datetime.utcnow(),
                    'updated_at': __import__('datetime').datetime.utcnow()
                }
                coll.insert_one(doc)
                doc['id'] = str(doc.pop('_id'))
                message = 'Service availability created successfully'
            
            return JsonResponse({'message': message}, status=201)
            
        except Exception as e:
            print(f"Error in service_availability: {str(e)}")  # Debug log
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)
