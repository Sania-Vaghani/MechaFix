from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import connection
import json
import jwt
from bson.objectid import ObjectId
import re


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
