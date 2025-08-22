from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import traceback
import random
from datetime import datetime
from threading import Timer
from bson import ObjectId
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pandas as pd
import jwt

from django.conf import settings

# Your recommendation import
from .recommendation import get_top_mechanics

# Load env
load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME')

client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]

# -----------------------------
# API: Get mechanics
# -----------------------------
@csrf_exempt
def get_mechanics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lat = data.get("lat")
            lon = data.get("lon")
            breakdown_type = data.get("breakdown_type", "engine")
            offset = int(data.get("offset", 0))
            limit = int(data.get("limit", 5))
            
            if lat is None or lon is None:
                return JsonResponse({'status': 'error', 'message': 'Latitude and longitude are required'}, status=400)

            try:
                lat = float(lat)
                lon = float(lon)
            except (ValueError, TypeError):
                return JsonResponse({'status': 'error', 'message': 'Invalid latitude or longitude values'}, status=400)

            mechanics_df = get_top_mechanics(lat, lon, breakdown_type, offset, limit)

            if mechanics_df.empty:
                return JsonResponse({'status': 'success', 'mechanics': []})

            mechanics_df = mechanics_df.where(pd.notnull(mechanics_df), None)
            mechanic_list = mechanics_df.to_dict(orient='records')

            return JsonResponse({'status': 'success', 'mechanics': mechanic_list})
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e), 'details': traceback.format_exc()}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)


# -----------------------------
# API: Create service request (auto-cancel in 60s)
# -----------------------------
@csrf_exempt
def create_service_request(request):
    print("📥 Incoming service request:", request.body)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            lat = float(data.get("lat"))
            lon = float(data.get("lon"))
            breakdown_type = data.get("breakdown_type", "engine")
            user_id = data.get("user_id")
            user_name = data.get("user_name")
            user_phone = data.get("user_phone")

            if not lat or not lon:
                return JsonResponse({"status": "error", "message": "Missing coordinates"}, status=400)

            # ✅ CASE 1: Direct request
            if "mechanics_list" in data and len(data["mechanics_list"]) == 1:
                mechanic_list = []

                for m in data["mechanics_list"]:
                    mech_id = None
                    if m.get("mech_id"):
                        mech_id = str(m["mech_id"])
                    else:
                        mech_doc = db.auth_mech.find_one(
                            {"garage_name": {"$regex": f"^{m.get('mech_name', '')}$", "$options": "i"}},
                            {"_id": 1}
                        )
                        if mech_doc:
                            mech_id = str(mech_doc["_id"])

                    if not mech_id:
                        return JsonResponse({"status": "error", "message": "Mechanic not found"}, status=400)

                    mechanic_list.append({
                        "mech_id": mech_id,
                        "mech_name": m.get("mech_name"),
                        "road_distance_km": round(float(m.get("road_distance_km", 0)), 2) if m.get("road_distance_km") else None,
                        "status": "pending"
                    })

                # Generate unique OTP for this request
                otp_code = str(random.randint(1000, 9999))
                
                req_id = db.service_requests.insert_one({
                    "user_id": user_id,
                    "user_name": user_name,
                    "user_phone": user_phone,
                    "lat": lat,
                    "lon": lon,
                    "breakdown_type": breakdown_type,
                    "mechanics_list": mechanic_list,
                    "direct_request": True,
                    "created_at": datetime.utcnow(),
                    "accepted_by": None,
                    "car_model": data.get("car_model"),
                    "year": data.get("year"),
                    "license_plate": data.get("license_plate"),
                    "description": data.get("description"),
                    "issue_type": data.get("issue_type"),
                    "image_url": data.get("image_url"),
                    "otp_code": otp_code,  # Store the OTP
                }).inserted_id

                return JsonResponse({"status": "success", "request_id": str(req_id)})

            # Fetch user info if missing
            if user_id and (not user_name or not user_phone):
                user_doc = db.auth_users.find_one({"_id": ObjectId(user_id)}, {"username": 1, "phone": 1})
                if user_doc:
                    user_name = user_doc.get("username", "Unknown User")
                    user_phone = user_doc.get("phone", "N/A")

            # Get mechanics with distances
            mechanics_df = get_top_mechanics(lat, lon, breakdown_type, 0, 5)
            mechanics_df = mechanics_df.where(pd.notnull(mechanics_df), None)
            mechanic_list = mechanics_df.to_dict(orient='records')

            for m in mechanic_list:
                mech_doc = db.auth_mech.find_one({"garage_name": m["mech_name"]}, {"_id": 1})
                m["mech_id"] = str(mech_doc["_id"]) if mech_doc else None
                m["status"] = "pending"

            # Generate unique OTP for this request
            otp_code = str(random.randint(1000, 9999))
            
            req_id = db.service_requests.insert_one({
                "user_id": user_id,
                "user_name": user_name,
                "user_phone": user_phone,
                "lat": lat,
                "lon": lon,
                "breakdown_type": breakdown_type,
                "mechanics_list": mechanic_list,
                "created_at": datetime.utcnow(),
                "accepted_by": None,
                "car_model": data.get("car_model"),
                "year": data.get("year"),
                "license_plate": data.get("license_plate"),
                "description": data.get("description"),
                "issue_type": data.get("issue_type"),
                "image_url": data.get("image_url"),
                "otp_code": otp_code,  # Store the OTP
            }).inserted_id

            # Auto-cancel after 60s
            def cancel_if_unaccepted(request_id):
                req = db.service_requests.find_one({"_id": ObjectId(request_id)})
                if req:
                    all_pending = all(m.get("status") == "pending" for m in req.get("mechanics_list", []))
                    if all_pending:
                        updated_list = []
                        for m in req.get("mechanics_list", []):
                            m["status"] = "cancelled"
                            updated_list.append(m)
                        db.service_requests.update_one(
                            {"_id": ObjectId(request_id)},
                            {"$set": {"mechanics_list": updated_list, "cancelled_at": datetime.utcnow()}}
                        )

            Timer(120, cancel_if_unaccepted, args=[str(req_id)]).start()

            return JsonResponse({"status": "success", "request_id": str(req_id)})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)


# -----------------------------
# API: Mechanic accepts request
# -----------------------------
@csrf_exempt
def mechanic_accept_request(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request_id = data.get("request_id")
            mech_id = data.get("mech_id")
            user_details = data.get("user_details", {})

            if not request_id or not mech_id:
                return JsonResponse({"status": "error", "message": "Missing request_id or mech_id"}, status=400)

            req = db.service_requests.find_one({"_id": ObjectId(request_id)})
            if not req:
                return JsonResponse({"status": "error", "message": "Request not found"}, status=404)

            updated_list = []
            for m in req.get("mechanics_list", []):
                if str(m.get("mech_id")) == str(mech_id):
                    m["status"] = "accepted"
                else:
                    if m.get("status") == "pending":
                        m["status"] = "cancelled"
                updated_list.append(m)

            db.service_requests.update_one(
                {"_id": ObjectId(request_id)},
                {"$set": {
                    "mechanics_list": updated_list,
                    "accepted_by": str(mech_id),
                    "accepted_at": datetime.utcnow()
                }}
            )

            db.auth_mech.update_one(
                {"_id": ObjectId(mech_id)},
                {"$push": {"user_history": user_details}}
            )

            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

def get_mechanics_list(request):
    """Get list of mechanics from auth_mech collection who have worked with the current user"""
    print(f"🔍 get_mechanics_list called with method: {request.method}")
    print(f"🔍 Request GET params: {request.GET}")
    
    if request.method == "GET":
        try:
            # Get the current user's name from the request
            # We need to get this from the user's profile or pass it as a parameter
            user_id = request.GET.get('user_id')
            print(f"🔍 user_id from request: {user_id}")
            
            if not user_id:
                print("❌ No user_id provided")
                return JsonResponse({
                    "status": "error", 
                    "message": "user_id parameter is required"
                }, status=400)
            
            # First get the current user's details to find their name
            print(f"🔍 Looking up user with ID: {user_id}")
            user = db.auth_users.find_one({"_id": ObjectId(user_id)})
            if not user:
                print(f"❌ User not found with ID: {user_id}")
                return JsonResponse({
                    "status": "error", 
                    "message": "User not found"
                }, status=404)
            
            user_name = user.get("username", "")
            print(f"🔍 Found user: {user_name}")
            print(f"🔍 Looking for mechanics with user '{user_name}' in their history")
            
            # Find mechanics who have this user in their user_history
            query = {
                "active_mech": True,
                "user_history": {
                    "$elemMatch": {
                        "user_name": user_name
                    }
                }
            }
            print(f"🔍 MongoDB query: {query}")
            
            mechanics = list(db.auth_mech.find(query, {
                "_id": 1,
                "username": 1,
                "phone": 1,
                "garage_name": 1,
                "address": 1,
                "active_mech": 1,
                "user_history": 1
            }))
            
            print(f"🔍 Raw mechanics found: {len(mechanics)}")
            for mech in mechanics:
                print(f"  - {mech.get('username')} ({mech.get('garage_name')})")
            
            # Convert ObjectId to string for JSON serialization
            for mech in mechanics:
                mech["_id"] = str(mech["_id"])
                # Count how many times this user has worked with this mechanic
                user_requests = [h for h in mech.get("user_history", []) if h.get("user_name") == user_name]
                mech["user_request_count"] = len(user_requests)
                # Get the most recent request details
                if user_requests:
                    latest_request = max(user_requests, key=lambda x: x.get("recorded_at", ""))
                    mech["last_service_date"] = latest_request.get("recorded_at", "")
                    mech["last_service_type"] = latest_request.get("breakdown_type", "")
            
            # Sort by most recent interaction first
            mechanics.sort(key=lambda x: x.get("last_service_date", ""), reverse=True)
            
            # Take only first 10 mechanics
            mechanics = mechanics[:10]
            
            print(f"🔍 Final mechanics to return: {len(mechanics)}")
            return JsonResponse({
                "status": "success",
                "mechanics": mechanics,
                "count": len(mechanics),
                "user_name": user_name
            })
            
        except Exception as e:
            print(f"❌ Error in get_mechanics_list: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({
                "status": "error", 
                "message": f"Failed to fetch mechanics: {str(e)}"
            }, status=500)
    
    print(f"❌ Invalid method: {request.method}")
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

# -----------------------------
# API: Get pending requests
# -----------------------------
@csrf_exempt
def get_pending_requests(request):
    if request.method == "GET":
        try:
            mech_id = request.GET.get("mech_id")
            query = {}

            pending = list(db.service_requests.find(
                query,
                {
                    "_id": 1, "user_id": 1, "user_name": 1, "user_phone": 1,
                    "breakdown_type": 1, "mechanics_list": 1, "created_at": 1,
                    "car_model": 1, "year": 1, "license_plate": 1,
                    "description": 1, "issue_type": 1, "image_url": 1,
                    "direct_request": 1, "lat": 1, "lon": 1,
                    "accepted_by": 1, "otp_code": 1  # Add OTP to projection
                }
            ))

            results = []
            for req in pending:
                req["_id"] = str(req["_id"])

                if (not req.get("user_name") or req["user_name"] == "Unknown User") and req.get("user_id"):
                    user_doc = db.auth_users.find_one({"_id": ObjectId(req["user_id"])}, {"username": 1, "phone": 1})
                    if user_doc:
                        req["user_name"] = user_doc.get("username", "Unknown User")
                        req["user_phone"] = user_doc.get("phone", "N/A")

                mech_list = []
                for mech in req.get("mechanics_list", []):
                    if isinstance(mech.get("mech_id"), ObjectId):
                        mech["mech_id"] = str(mech["mech_id"])
                    if "road_distance_km" in mech and mech["road_distance_km"] is not None:
                        mech["road_distance_km"] = round(float(mech["road_distance_km"]), 2)
                    mech_list.append(mech)

                req["mechanics_list"] = mech_list

                if mech_id:
                    found = next((m for m in mech_list if str(m.get("mech_id")) == str(mech_id)), None)
                    if not found or found.get("status") != "pending":
                        continue
                    # Also check if this mechanic has already completed this request
                    if found.get("status") == "completed":
                        continue
                else:
                    has_pending = any(m.get("status") == "pending" for m in mech_list)
                    if not has_pending:
                        continue

                results.append(req)

            return JsonResponse({"status": "success", "requests": results})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)


# -----------------------------
# API: Mechanic rejects request
# -----------------------------
@csrf_exempt
def mechanic_reject_request(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request_id = data.get("request_id")
            mech_id = data.get("mech_id")

            if not request_id or not mech_id:
                return JsonResponse({"status": "error", "message": "Missing request_id or mech_id"}, status=400)

            req = db.service_requests.find_one({"_id": ObjectId(request_id)})
            if not req:
                return JsonResponse({"status": "error", "message": "Request not found"}, status=404)

            # Direct request: reject closes request
            if req.get("direct_request", False):
                updated_list = []
                for mech in req.get("mechanics_list", []):
                    if str(mech.get("mech_id")) == str(mech_id):
                        mech["status"] = "rejected"
                    updated_list.append(mech)
                db.service_requests.update_one(
                    {"_id": ObjectId(request_id)},
                    {"$set": {"mechanics_list": updated_list, "rejected_by": mech_id, "rejected_at": datetime.utcnow()}}
                )
                return JsonResponse({"status": "success", "message": "Direct request rejected"})

            # Broadcast: update mechanic’s status
            updated_list = []
            all_rejected = True
            for mech in req.get("mechanics_list", []):
                if str(mech.get("mech_id")) == str(mech_id):
                    mech["status"] = "rejected"
                if mech.get("status") == "pending":
                    all_rejected = False
                updated_list.append(mech)

            update_data = {"mechanics_list": updated_list}
            if all_rejected:
                for m in updated_list:
                    if m.get("status") == "pending":
                        m["status"] = "cancelled"
                update_data["mechanics_list"] = updated_list
                update_data["cancelled_at"] = datetime.utcnow()

            db.service_requests.update_one(
                {"_id": ObjectId(request_id)},
                {"$set": update_data}
            )

            return JsonResponse({"status": "success", "message": "Mechanic rejected request"})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)


# -----------------------------
# API: Get service request detail
# -----------------------------
@csrf_exempt
def get_service_request_detail(request, request_id):
    if request.method == "GET":
        try:
            req = db.service_requests.find_one({"_id": ObjectId(request_id)})
            if not req:
                return JsonResponse({"status": "error", "message": "Request not found"}, status=404)

            req["_id"] = str(req["_id"])
            if req.get("user_id"):
                req["user_id"] = str(req["user_id"])

            for m in req.get("mechanics_list", []):
                if isinstance(m.get("mech_id"), ObjectId):
                    m["mech_id"] = str(m["mech_id"])

            return JsonResponse({"status": "success", "request": req}, safe=False)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)


# -----------------------------
# API: Assign mechanic manually
# -----------------------------
@csrf_exempt
def assign_mechanic(request, req_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body)
        mech_id = data.get('mech_id')

        if not mech_id:
            return JsonResponse({'error': 'mech_id required'}, status=400)

        mech = db.auth_mech.find_one({'_id': ObjectId(mech_id)})
        if not mech:
            return JsonResponse({'error': 'Mechanic not found'}, status=404)

        result = db.service_requests.update_one(
            {"_id": ObjectId(req_id), "mechanics_list.mech_id": str(mech_id)},
            {
                "$set": {
                    "accepted_by": str(mech["_id"]),
                    "mechanics_list.$.status": "accepted",
                    "accepted_mech": {
                        "mech_id": str(mech["_id"]),
                        "mech_name": mech.get("username"),
                        "mech_phone": mech.get("phone"),
                        "coords": mech.get("coords", {}),
                        "garage_name": mech.get("garage_name"),
                    }
                }
            }
        )

        if result.matched_count == 0:
            return JsonResponse({'error': 'Service request not found'}, status=404)

        return JsonResponse({'message': 'Mechanic assigned successfully'})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def assign_worker(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
        req_id = data.get("request_id")
        worker_id = data.get("worker_id")

        if not req_id or not worker_id:
            return JsonResponse({"error": "request_id and worker_id are required"}, status=400)

        worker = db.mech_worker.find_one({"_id": ObjectId(worker_id)})
        if not worker:
            return JsonResponse({"error": "Worker not found"}, status=404)

        garage = db.auth_mech.find_one({"garage_name": worker.get("garage_name")})
        if not garage:
            return JsonResponse({"error": "Garage not found"}, status=404)

        assigned_worker = {
            "worker_id": str(worker["_id"]),
            "worker_name": worker.get("name"),
            "worker_phone": worker.get("phone"),
            "garage_name": garage.get("garage_name"),
            "garage_coords": garage.get("coords", {}),
        }

        req = db.service_requests.find_one({"_id": ObjectId(req_id)})
        if not req:
            return JsonResponse({"error": "Service request not found"}, status=404)

        updated_list = []
        for m in req.get("mechanics_list", []):
            if str(m.get("mech_id")) == str(garage.get("_id")):
                m["status"] = "accepted"
            else:
                if m.get("status") == "pending":
                    m["status"] = "cancelled"
            updated_list.append(m)

        result = db.service_requests.update_one(
            {"_id": ObjectId(req_id)},
            {"$set": {
                "assigned_worker": assigned_worker,
                "worker_assigned_at": datetime.utcnow(),
                "mechanics_list": updated_list,
                "accepted_by": str(garage.get("_id"))
            }}
        )

        if result.matched_count == 0:
            return JsonResponse({"error": "Service request not found"}, status=404)

        # ✅ Append to mechanic's user history for reporting/audit
        try:
            history_entry = {
                "request_id": str(req.get("_id")),
                "user_id": str(req.get("user_id")) if req.get("user_id") else None,
                "user_name": req.get("user_name"),
                "user_phone": req.get("user_phone"),
                "breakdown_type": req.get("breakdown_type"),
                "assigned_worker": assigned_worker,
                "recorded_at": datetime.utcnow(),
            }
            db.auth_mech.update_one(
                {"_id": garage.get("_id")},
                {"$push": {"user_history": history_entry}}
            )
        except Exception:
            # Don't fail the API if history push fails; it's non-critical
            pass

        return JsonResponse({"status": "success", "assigned_worker": assigned_worker})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_assigned_requests(request):
    if request.method == "GET":
        try:
            mech_id = request.GET.get("mech_id")
            worker_id = request.GET.get("worker_id")

            if not mech_id and not worker_id:
                return JsonResponse({"status": "error", "message": "mech_id or worker_id required"}, status=400)

            query = {}
            if mech_id:
                query["accepted_by"] = str(mech_id)
            if worker_id:
                query["assigned_worker.worker_id"] = str(worker_id)

            docs = list(db.service_requests.find(query).sort("worker_assigned_at", -1))
            out = []
            for d in docs:
                # Filter out requests where this mechanic's status is completed
                if mech_id:
                    mech_completed = False
                    for mech in d.get('mechanics_list', []):
                        if str(mech.get('mech_id')) == str(mech_id) and mech.get('status') == 'completed':
                            mech_completed = True
                            break
                    if mech_completed:
                        continue
                
                out.append({
                    "id": str(d["_id"]),
                    "_id": str(d["_id"]),  # Add _id for consistency
                    "user_id": str(d.get("user_id")) if d.get("user_id") else None,
                    "user_name": d.get("user_name"),
                    "user_phone": d.get("user_phone"),
                    "breakdown_type": d.get("breakdown_type"),
                    "lat": d.get("lat"),
                    "lon": d.get("lon"),
                    "address": d.get("address"),
                    "car_model": d.get("car_model"),
                    "license_plate": d.get("license_plate"),
                    "description": d.get("description"),
                    "issue_type": d.get("issue_type"),
                    "assigned_worker": d.get("assigned_worker", {}),
                    "otp_code": d.get("otp_code"),  # Add OTP
                })
            return JsonResponse({"status": "success", "requests": out})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

@csrf_exempt
def get_user_active_request(request):
    if request.method == "GET":
        try:
            user_id = request.GET.get("user_id")
            if not user_id:
                return JsonResponse({"status": "error", "message": "user_id required"}, status=400)

            query = {"user_id": str(user_id)}
            docs = list(db.service_requests.find(query).sort("created_at", -1))

            for d in docs:
                # Active if not completed and either assigned_worker exists or any mechanic accepted/assigned
                # Check if any mechanic has completed this request
                any_completed = any(m.get("status") == "completed" for m in d.get("mechanics_list", []))
                if any_completed:
                    continue
                    
                has_assigned_worker = bool(d.get("assigned_worker"))
                has_accepted = any(m.get("status") in ["accepted", "assigned"] for m in d.get("mechanics_list", []))
                if (has_assigned_worker or has_accepted):
                    d["_id"] = str(d["_id"])
                    if d.get("user_id"):
                        d["user_id"] = str(d["user_id"])
                    for m in d.get("mechanics_list", []):
                        if isinstance(m.get("mech_id"), ObjectId):
                            m["mech_id"] = str(m["mech_id"])
                    return JsonResponse({"status": "success", "request": d})

            return JsonResponse({"status": "success", "request": None})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

@csrf_exempt
def verify_otp_and_complete(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    
    try:
        print(f"🔐 OTP verification request received: {request.body}")
        data = json.loads(request.body)
        print(f"📋 Parsed data: {data}")
        
        request_id = data.get('request_id')
        otp_code = data.get('otp_code')
        worker_id = data.get('worker_id')
        
        print(f"🔍 Extracted: request_id={request_id}, otp_code={otp_code}, worker_id={worker_id}")
        
        if not all([request_id, otp_code, worker_id]):
            return JsonResponse({'error': 'request_id, otp_code, and worker_id required'}, status=400)
        
        # Find the request
        req = db.service_requests.find_one({"_id": ObjectId(request_id)})
        print(f"📄 Found request: {req}")
        
        if not req:
            print(f"❌ Request {request_id} not found in database")
            return JsonResponse({'error': 'Request not found'}, status=404)
        
        print(f"🔍 Request details:")
        print(f"   _id: {req.get('_id')}")
        print(f"   user_id: {req.get('user_id')}")
        print(f"   status: {req.get('status')}")
        print(f"   assigned_worker: {req.get('assigned_worker')}")
        print(f"   mechanics_list: {req.get('mechanics_list')}")
        print(f"   otp_code: {req.get('otp_code')}")
        
        # Verify the request is assigned to this worker
        # Check if worker is either in assigned_worker or in mechanics_list with accepted status
        worker_authorized = False
        
        # Check assigned_worker field
        if req.get('assigned_worker') and str(req['assigned_worker'].get('worker_id')) == str(worker_id):
            worker_authorized = True
        
        # Check mechanics_list for accepted status
        if not worker_authorized and req.get('mechanics_list'):
            for mech in req['mechanics_list']:
                if str(mech.get('mech_id')) == str(worker_id) and mech.get('status') in ['accepted', 'assigned']:
                    worker_authorized = True
                    break
        
        if not worker_authorized:
            print(f"❌ Worker {worker_id} not authorized for request {request_id}")
            print(f"   assigned_worker: {req.get('assigned_worker')}")
            print(f"   mechanics_list: {req.get('mechanics_list')}")
            return JsonResponse({'error': 'Worker not authorized for this request'}, status=403)
        
        # Check if request is already completed by this mechanic
        if req.get('mechanics_list'):
            for mech in req['mechanics_list']:
                if str(mech.get('mech_id')) == str(worker_id) and mech.get('status') == 'completed':
                    return JsonResponse({'error': 'Request already completed by this mechanic'}, status=400)
        
        # Verify OTP against stored value
        stored_otp = req.get('otp_code')
        if not stored_otp:
            return JsonResponse({'error': 'No OTP found for this request'}, status=400)
        
        if not otp_code or len(otp_code) != 4 or not otp_code.isdigit():
            return JsonResponse({'error': 'Invalid OTP format'}, status=400)
        
        if otp_code != stored_otp:
            return JsonResponse({'error': 'Invalid OTP code'}, status=400)
        
        print(f"✅ OTP verified, updating request {request_id} to completed")
        
        # Mark request as completed by updating the specific mechanic's status
        # Find the mechanic in mechanics_list and update their status
        updated_mechanics_list = []
        mechanic_updated = False
        
        for mech in req.get('mechanics_list', []):
            if str(mech.get('mech_id')) == str(worker_id):
                mech['status'] = 'completed'
                mechanic_updated = True
            updated_mechanics_list.append(mech)
        
        if not mechanic_updated:
            return JsonResponse({'error': 'Mechanic not found in mechanics list'}, status=500)
        
        # Update the request with completed mechanic status and completion details
        result = db.service_requests.update_one(
            {"_id": ObjectId(request_id)},
            {
                "$set": {
                    "mechanics_list": updated_mechanics_list,
                    "completed_at": datetime.utcnow(),
                    "otp_verified": True,
                    "otp_code_used": otp_code
                }
            }
        )
        
        print(f"📝 Update result: {result.modified_count} documents modified")
        
        if result.modified_count > 0:
            return JsonResponse({
                "status": "success", 
                "message": "Request completed successfully",
                "request_id": request_id
            })
        else:
            return JsonResponse({'error': 'Failed to update request'}, status=500)
            
    except Exception as e:
        print(f"❌ Error in OTP verification: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# -----------------------------
# API: Get today's overview for mechanics
# -----------------------------
@csrf_exempt
def get_today_overview(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JsonResponse({'error': 'Authorization token required'}, status=401)

        # Get user from token and validate
        try:
            # Decode JWT token to get user info
            print(f"🔍 [get_today_overview] Decoding token: {token[:20]}...")
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print(f"🔍 [get_today_overview] Token payload: {payload}")
            username = payload.get('username')
            user_type = payload.get('user_type')
            print(f"🔍 [get_today_overview] Extracted username: {username}, user_type: {user_type}")
            
            if not username or user_type != 'mechanic':
                print(f"❌ [get_today_overview] Invalid token - username: {username}, user_type: {user_type}")
                return JsonResponse({'error': 'Invalid token - must be mechanic user'}, status=401)
                
        except jwt.ExpiredSignatureError:
            print(f"❌ [get_today_overview] JWT token expired")
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError as e:
            print(f"❌ [get_today_overview] Invalid JWT token: {str(e)}")
            return JsonResponse({'error': f'Invalid token: {str(e)}'}, status=401)
        except Exception as e:
            print(f"❌ [get_today_overview] JWT decode error: {str(e)}")
            return JsonResponse({'error': f'Token decode error: {str(e)}'}, status=500)

        # Connect to MongoDB
        # db is already defined at the top of the file
        
        # Get mechanic by username to get their ID
        mechanic = db['auth_mech'].find_one({'username': username})
        if not mechanic:
            print(f"❌ [get_today_overview] Mechanic not found with username: {username}")
            return JsonResponse({'error': 'Mechanic not found'}, status=404)
        
        mechanic_id = str(mechanic['_id'])
        print(f"🔍 [get_today_overview] Found mechanic ID: {mechanic_id}")
        
        # Get today's date range
        from datetime import datetime, timezone
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Get service requests created today
        today_requests = list(db['service_requests'].find({
            'created_at': {
                '$gte': today_start,
                '$lte': today_end
            }
        }))
        
        # Calculate overview stats
        total = len(today_requests)
        completed = 0
        pending = 0
        
        for request in today_requests:
            # Check mechanics_list for status
            if 'mechanics_list' in request:
                for mechanic in request['mechanics_list']:
                    if mechanic.get('status') == 'completed':
                        completed += 1
                        break
                    elif mechanic.get('status') in ['pending', 'accepted']:
                        pending += 1
                        break
        
        overview = {
            'total': total,
            'pending': pending,
            'completed': completed
        }

        print(f"📊 [get_today_overview] Today's stats: {overview}")
        
        return JsonResponse({
            'status': 'success',
            'overview': overview
        })

    except Exception as e:
        print(f"❌ [get_today_overview] Error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# -----------------------------
# API: Get recent service requests
# -----------------------------
@csrf_exempt
def get_recent_requests(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JsonResponse({'error': 'Authorization token required'}, status=401)

        # Get user from token and validate
        try:
            # Decode JWT token to get user info
            print(f"🔍 [get_recent_requests] Decoding token: {token[:20]}...")
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print(f"🔍 [get_recent_requests] Token payload: {payload}")
            username = payload.get('username')
            user_type = payload.get('user_type')
            print(f"🔍 [get_recent_requests] Extracted username: {username}, user_type: {user_type}")
            
            if not username or user_type != 'mechanic':
                print(f"❌ [get_recent_requests] Invalid token - username: {username}, user_type: {user_type}")
                return JsonResponse({'error': 'Invalid token - must be mechanic user'}, status=401)
                
        except jwt.ExpiredSignatureError:
            print(f"❌ [get_recent_requests] JWT token expired")
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError as e:
            print(f"❌ [get_recent_requests] Invalid JWT token: {str(e)}")
            return JsonResponse({'error': f'Invalid token: {str(e)}'}, status=401)
        except Exception as e:
            print(f"❌ [get_recent_requests] JWT decode error: {str(e)}")
            return JsonResponse({'error': f'Token decode error: {str(e)}'}, status=500)

        # Connect to MongoDB
        # db is already defined at the top of the file
        
        # Get mechanic by username to get their ID
        mechanic = db['auth_mech'].find_one({'username': username})
        if not mechanic:
            print(f"❌ [get_recent_requests] Mechanic not found with username: {username}")
            return JsonResponse({'error': 'Mechanic not found'}, status=404)
        
        mechanic_id = str(mechanic['_id'])
        print(f"🔍 [get_recent_requests] Found mechanic ID: {mechanic_id}")
        
        # Get all service requests from service_requests collection
        service_requests = list(db['service_requests'].find({}).sort('created_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for request in service_requests:
            request['_id'] = str(request['_id'])
            if 'created_at' in request:
                request['created_at'] = request['created_at'].isoformat()
            if 'completed_at' in request:
                request['completed_at'] = request['completed_at'].isoformat()
            if 'worker_assigned_at' in request:
                request['worker_assigned_at'] = request['worker_assigned_at'].isoformat()

        print(f"🔍 [get_recent_requests] Found {len(service_requests)} service requests")
        
        return JsonResponse({
            'status': 'success',
            'requests': service_requests
        })

    except Exception as e:
        print(f"❌ [get_recent_requests] Error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



# -----------------------------
# API: Get completed service requests for customer history
# -----------------------------
@csrf_exempt
def get_completed_requests(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JsonResponse({'error': 'Authorization token required'}, status=401)

        # Get user from token and validate
        try:
            # Decode JWT token to get user info
            print(f"🔍 [get_completed_requests] Decoding token: {token[:20]}...")
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print(f"🔍 [get_completed_requests] Token payload: {payload}")
            username = payload.get('username')
            user_type = payload.get('user_type')
            print(f"🔍 [get_completed_requests] Extracted username: {username}, user_type: {user_type}")
            
            if not username or user_type != 'mechanic':
                print(f"❌ [get_completed_requests] Invalid token - username: {username}, user_type: {user_type}")
                return JsonResponse({'error': 'Invalid token - must be mechanic user'}, status=401)
                
        except jwt.ExpiredSignatureError:
            print(f"❌ [get_completed_requests] JWT token expired")
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError as e:
            print(f"❌ [get_completed_requests] Invalid JWT token: {str(e)}")
            return JsonResponse({'error': f'Invalid token: {str(e)}'}, status=401)
        except Exception as e:
            print(f"❌ [get_completed_requests] JWT decode error: {str(e)}")
            return JsonResponse({'error': f'Token decode error: {str(e)}'}, status=500)

        # Connect to MongoDB
        # db is already defined at the top of the file
        
        # Get mechanic by username to get their ID
        mechanic = db['auth_mech'].find_one({'username': username})
        if not mechanic:
            print(f"❌ [get_completed_requests] Mechanic not found with username: {username}")
            return JsonResponse({'error': 'Mechanic not found'}, status=404)
        
        mechanic_id = str(mechanic['_id'])
        print(f"🔍 [get_completed_requests] Found mechanic ID: {mechanic_id}")
        
        # Get completed service requests from service_requests collection
        # Look for requests where any mechanic in mechanics_list has status 'completed'
        completed_requests = list(db['service_requests'].find({
            'mechanics_list': {
                '$elemMatch': {
                    'status': 'completed'
                }
            }
        }).sort('completed_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for request in completed_requests:
            request['_id'] = str(request['_id'])
            if 'created_at' in request:
                request['created_at'] = request['created_at'].isoformat()
            if 'completed_at' in request:
                request['completed_at'] = request['completed_at'].isoformat()
            if 'worker_assigned_at' in request:
                request['worker_assigned_at'] = request['worker_assigned_at'].isoformat()

        print(f"🔍 [get_completed_requests] Found {len(completed_requests)} completed service requests")
        
        return JsonResponse({
            'status': 'success',
            'requests': completed_requests
        })

    except Exception as e:
        print(f"❌ [get_completed_requests] Error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


# -----------------------------
# API: Submit rating and comment for completed service
# -----------------------------
@csrf_exempt
def submit_rating(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        print(f"⭐ Rating submission request received: {request.body}")
        data = json.loads(request.body)
        print(f"📋 Parsed rating data: {data}")
        
        # Extract required fields
        request_id = data.get('request_id')
        mechanic_id = data.get('mechanic_id')
        mechanic_name = data.get('mechanic_name')
        service_type = data.get('service_type')
        user_name = data.get('user_name')
        user_phone = data.get('user_phone')
        car_details = data.get('car_details')
        breakdown_type = data.get('breakdown_type')
        rating = data.get('rating')
        comment = data.get('comment')
        
        # Validate required fields
        if not all([request_id, mechanic_id, mechanic_name, rating, comment]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return JsonResponse({'error': 'Rating must be between 1 and 5'}, status=400)
        
        if not isinstance(comment, str) or len(comment.strip()) < 3:
            return JsonResponse({'error': 'Comment must be at least 3 characters'}, status=400)
        
        # Use the global MongoDB connection
        # db is already defined at the top of the file
        
        # 1. Store rating in find_mech collection
        find_mech_doc = {
            'mech_name': mechanic_name,
            'mech_lat': 23.027552,  # Default coordinates - can be updated later
            'mech_long': 72.472305,
            'rating': float(rating),
            'comment': comment.strip(),
            'breakdown_type': breakdown_type or 'general',
            'selected': 1
        }
        
        # Insert into find_mech collection
        find_mech_result = db['find_mech'].insert_one(find_mech_doc)
        print(f"📝 Rating stored in find_mech collection with ID: {find_mech_result.inserted_id}")
        
        # 2. Update mech_worker collection with rating
        # First, try to find the worker in mech_worker collection
        worker = None
        worker_id = mechanic_id
        
        # Try to find worker by ID first
        try:
            worker = db['mech_worker'].find_one({'_id': ObjectId(mechanic_id)})
        except:
            pass
        
        # If not found in mech_worker, try to find by garage name in auth_mech
        if not worker:
            try:
                garage_owner = db['auth_mech'].find_one({'_id': ObjectId(mechanic_id)})
                if garage_owner and garage_owner.get('garage_name'):
                    # Find any worker from this garage
                    worker = db['mech_worker'].find_one({'garage_name': garage_owner['garage_name']})
                    if worker:
                        worker_id = str(worker['_id'])
                        print(f"🔍 Found worker from garage: {worker['name']} (ID: {worker_id})")
            except:
                pass
        
        if worker:
            # Calculate new average rating
            current_ratings = worker.get('ratings', [])
            current_ratings.append({
                'rating': float(rating),
                'comment': comment.strip(),
                'user_name': user_name,
                'service_type': service_type,
                'request_id': request_id,
                'created_at': datetime.utcnow()
            })
            
            # Calculate average rating
            total_rating = sum(r['rating'] for r in current_ratings)
            average_rating = round(total_rating / len(current_ratings), 1)
            
            # Update worker document
            update_result = db['mech_worker'].update_one(
                {'_id': ObjectId(worker_id)},
                {
                    '$set': {
                        'rating': average_rating,
                        'total_ratings': len(current_ratings),
                        'ratings': current_ratings
                    }
                }
            )
            
            if update_result.modified_count > 0:
                print(f"✅ Worker rating updated successfully. New average: {average_rating}")
            else:
                print(f"⚠️ Worker rating update may have failed")
        else:
            print(f"⚠️ Worker not found in mech_worker collection: {mechanic_id}")
        
        # 3. Update service_requests collection to mark as rated
        service_update_result = db['service_requests'].update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'rated': True,
                    'rating': float(rating),
                    'rating_comment': comment.strip(),
                    'rated_at': datetime.utcnow()
                }
            }
        )
        
        if service_update_result.modified_count > 0:
            print(f"✅ Service request marked as rated")
        else:
            print(f"⚠️ Service request rating update may have failed")
        
        return JsonResponse({
            'status': 'success',
            'message': 'Rating submitted successfully',
            'rating_id': str(find_mech_result.inserted_id),
            'average_rating': worker.get('rating') if worker else None
        })
        
    except Exception as e:
        print(f"❌ Error in rating submission: {str(e)}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return JsonResponse({'error': str(e)}, status=500)

