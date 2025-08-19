from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import traceback
from datetime import datetime
from threading import Timer
from bson import ObjectId
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pandas as pd

# Your recommendation import
from .recommendation import get_top_mechanics

# Load env
load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME')

client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]

# -----------------------------
# API: Get mechanics (already existed)
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

            # ✅ CASE 1: Direct request to one mechanic (same as broadcast logic)
            if "mechanics_list" in data and len(data["mechanics_list"]) == 1:
                mechanic_list = []

                for m in data["mechanics_list"]:
                    mech_id = None

                    # Find mechanic in auth_mech by garage_name or ID
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

                print(mechanic_list)

                req_id = db.service_requests.insert_one({
                    "user_id": user_id,
                    "user_name": user_name,
                    "user_phone": user_phone,
                    "lat": lat,
                    "lon": lon,
                    "breakdown_type": breakdown_type,
                    "mechanics_list": mechanic_list,
                    "status": "pending",
                    "direct_request": True,   # mark direct request
                    "created_at": datetime.utcnow(),
                    "accepted_by": None,

                    # ✅ save car details if provided
                    "car_model": data.get("car_model"),
                    "year": data.get("year"),
                    "license_plate": data.get("license_plate"),
                    "description": data.get("description"),
                    "issue_type": data.get("issue_type"),
                    "image_url": data.get("image_url"),
                }).inserted_id

                return JsonResponse({"status": "success", "request_id": str(req_id)})




            # Fetch from DB if not provided
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
                # Find mechanic in auth_mech by garage_name or coords
                mech_doc = db.auth_mech.find_one(
                    {"garage_name": m["mech_name"]},  # adjust if your naming differs
                    {"_id": 1}
                )
                if mech_doc:
                    m["mech_id"] = str(mech_doc["_id"])
                else:
                    m["mech_id"] = None  # fallback
                m["status"] = "pending"

            # Store request
            req_id = db.service_requests.insert_one({
                "user_id": user_id,
                "user_name": user_name,
                "user_phone": user_phone,
                "lat": lat,
                "lon": lon,
                "breakdown_type": breakdown_type,
                "mechanics_list": mechanic_list,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "accepted_by": None,
                "car_model": data.get("car_model"),
                "year": data.get("year"),
                "license_plate": data.get("license_plate"),
                "description": data.get("description"),
                "issue_type": data.get("issue_type"),
                "image_url": data.get("image_url"),
            }).inserted_id

            # Auto-cancel after 60s
            def cancel_if_unaccepted(request_id):
                req = db.service_requests.find_one({"_id": ObjectId(request_id)})
                if req and req.get("status") == "pending":
                    db.service_requests.update_one(
                        {"_id": ObjectId(request_id)},
                        {"$set": {"status": "cancelled", "cancelled_at": datetime.utcnow()}}
                    )

            Timer(60, cancel_if_unaccepted, args=[str(req_id)]).start()

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

            # Accept the request
            db.service_requests.update_one(
                {"_id": ObjectId(request_id)},
                {"$set": {"status": "accepted", "accepted_by": mech_id, "accepted_at": datetime.utcnow()}}
            )

            # Push user details to mechanic's history
            db.auth_mech.update_one(
                {"_id": ObjectId(mech_id)},
                {"$push": {"user_history": user_details}}
            )

            return JsonResponse({"status": "success"})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)


# -----------------------------
# API: Get only pending requests
# -----------------------------
# -----------------------------
# API: Get pending requests (with mechanic filter)
# -----------------------------
@csrf_exempt
def get_pending_requests(request):
    if request.method == "GET":
        try:
            mech_id = request.GET.get("mech_id")  # optional filter
            query = {"status": "pending"}

            pending = list(db.service_requests.find(
                query,
                {
                    "_id": 1, "user_id": 1, "user_name": 1, "user_phone": 1,
                    "breakdown_type": 1, "mechanics_list": 1, "created_at": 1,
                    "car_model": 1, "year": 1, "license_plate": 1,
                    "description": 1, "issue_type": 1, "image_url": 1,
                    "direct_request": 1, "status": 1,
                    "lat": 1, "lon": 1,  # Add lat and lon here
                }
            ))

            results = []
            for req in pending:
                req["_id"] = str(req["_id"])

                # Fill missing user details from DB
                if (not req.get("user_name") or req["user_name"] == "Unknown User") and req.get("user_id"):
                    user_doc = db.auth_users.find_one({"_id": ObjectId(req["user_id"])}, {"username": 1, "phone": 1})
                    if user_doc:
                        req["user_name"] = user_doc.get("username", "Unknown User")
                        req["user_phone"] = user_doc.get("phone", "N/A")

                # Format mechanics list
                mech_list = []
                for mech in req.get("mechanics_list", []):
                    # Normalize id
                    if isinstance(mech.get("mech_id"), ObjectId):
                        mech["mech_id"] = str(mech["mech_id"])
                    if "road_distance_km" in mech:
                        mech["road_distance_km"] = round(mech["road_distance_km"], 2)
                    mech_list.append(mech)

                req["mechanics_list"] = mech_list

                # If mechanic filter is given → show only if that mechanic is in list
                if mech_id:
                    found = next((m for m in mech_list if str(m.get("mech_id")) == str(mech_id)), None)
                    if not found:
                        continue
                    # If already rejected or accepted → skip
                    if found.get("status") != "pending":
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

            # Fetch request
            req = db.service_requests.find_one({"_id": ObjectId(request_id)})
            if not req:
                return JsonResponse({"status": "error", "message": "Request not found"}, status=404)

            # Case 1: Direct request → reject closes request
            if req.get("direct_request", False):
                db.service_requests.update_one(
                    {"_id": ObjectId(request_id)},
                    {"$set": {"status": "rejected", "rejected_by": mech_id, "rejected_at": datetime.utcnow()}}
                )
                return JsonResponse({"status": "success", "message": "Direct request rejected"})

            # Case 2: Broadcast request → mark mechanic status as rejected
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
                update_data["status"] = "cancelled"
                update_data["cancelled_at"] = datetime.utcnow()

            db.service_requests.update_one(
                {"_id": ObjectId(request_id)},
                {"$set": update_data}
            )

            return JsonResponse({"status": "success", "message": "Mechanic rejected request"})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

@csrf_exempt
def get_service_request_detail(request, request_id):
    if request.method == "GET":
        try:
            req = db.service_requests.find_one({"_id": ObjectId(request_id)})
            if not req:
                return JsonResponse({"status": "error", "message": "Request not found"}, status=404)

            # Convert ObjectId → str
            req["_id"] = str(req["_id"])
            if req.get("user_id"):
                req["user_id"] = str(req["user_id"])

            # Ensure mechanics list ids are strings
            for m in req.get("mechanics_list", []):
                if isinstance(m.get("mech_id"), ObjectId):
                    m["mech_id"] = str(m["mech_id"])

            return JsonResponse({"status": "success", "request": req}, safe=False)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

# Add this new endpoint
@csrf_exempt
def assign_worker(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request_id = data.get("request_id")
            worker_id = data.get("worker_id")
            worker_name = data.get("worker_name")
            worker_phone = data.get("worker_phone")

            if not all([request_id, worker_id, worker_name]):
                return JsonResponse({"status": "error", "message": "Missing required fields"}, status=400)

            # Update the service request with worker assignment
            db.service_requests.update_one(
                {"_id": ObjectId(request_id)},
                {
                    "$set": {
                        "status": "assigned",
                        "assigned_worker_id": worker_id,
                        "assigned_worker_name": worker_name,
                        "assigned_worker_phone": worker_phone,
                        "assigned_at": datetime.utcnow()
                    }
                }
            )

            return JsonResponse({"status": "success", "message": "Worker assigned successfully"})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

@csrf_exempt
def get_assigned_requests(request):
    if request.method == "GET":
        try:
            mech_id = request.GET.get("mech_id")
            if not mech_id:
                return JsonResponse({"status": "error", "message": "mech_id required"}, status=400)

            q = {
                "status": "assigned",
                "assigned_worker_id": {"$exists": True}
            }

            docs = list(db.service_requests.find(q).sort("assigned_at", -1))

            results = []
            for d in docs:
                d["_id"] = str(d["_id"])
                if isinstance(d.get("user_id"), ObjectId):
                    d["user_id"] = str(d["user_id"])
                results.append({
                    "id": d["_id"],
                    "user_name": d.get("user_name", "Unknown User"),
                    "user_phone": d.get("user_phone", "N/A"),
                    "breakdown_type": d.get("breakdown_type", d.get("issue_type", "N/A")),
                    "address": d.get("user_address") or d.get("address"),
                    "car_model": d.get("car_model"),
                    "license_plate": d.get("license_plate"),
                    "assigned_worker_id": d.get("assigned_worker_id"),
                    "assigned_worker_name": d.get("assigned_worker_name"),
                    "assigned_worker_phone": d.get("assigned_worker_phone"),
                    "assigned_at": d.get("assigned_at"),
                    "lat": d.get("lat"),
                    "lon": d.get("lon"),
                })

            return JsonResponse({"status": "success", "requests": results})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)
