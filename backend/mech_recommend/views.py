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
@csrf_exempt
def get_pending_requests(request):
    if request.method == "GET":
        try:
            pending = list(db.service_requests.find(
                {"status": "pending"},
                {
                    "_id": 1, "user_id": 1, "user_name": 1, "user_phone": 1,
                    "breakdown_type": 1, "mechanics_list": 1, "created_at": 1,
                    "car_model": 1, "year": 1, "license_plate": 1,
                    "description": 1, "issue_type": 1, "image_url": 1
                }
            ))


            for req in pending:
                req["_id"] = str(req["_id"])

                # Fill missing user details from DB
                if (not req.get("user_name") or req["user_name"] == "Unknown User") and req.get("user_id"):
                    user_doc = db.auth_users.find_one({"_id": ObjectId(req["user_id"])}, {"username": 1, "phone": 1})
                    if user_doc:
                        req["user_name"] = user_doc.get("username", "Unknown User")
                        req["user_phone"] = user_doc.get("phone", "N/A")


                # Format distance from first mechanic
                # Instead of just first mechanic distance
                if req.get("mechanics_list") and isinstance(req["mechanics_list"], list):
                    for mech in req["mechanics_list"]:
                        if "road_distance_km" in mech:
                            mech["road_distance_km"] = round(mech["road_distance_km"], 2)
                else:
                    req["mechanics_list"] = []



            return JsonResponse({"status": "success", "requests": pending})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)
