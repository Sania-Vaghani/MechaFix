from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .recommendation import get_top_mechanics  # 👈 import from your model file
import pandas as pd  # <-- Add this import
import traceback  # Add this import

# @csrf_exempt
# def get_mechanics(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             lat = float(data.get("lat"))
#             lon = float(data.get("lon"))
#             breakdown_type = data.get("breakdown_type", "engine")

#             top5_df = get_top_mechanics(lat, lon, breakdown_type)
#             top5_list = top5_df.to_dict(orient='records')

#             return JsonResponse({'status': 'success', 'mechanics': top5_list})
#         except Exception as e:
#             return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
#     return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def get_mechanics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Add validation for required fields
            lat = data.get("lat")
            lon = data.get("lon")
            breakdown_type = data.get("breakdown_type", "engine")
            offset = int(data.get("offset", 0))
            limit = int(data.get("limit", 5))
            
            # Re-enable validation
            if lat is None or lon is None:
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Latitude and longitude are required'
                }, status=400)
            
            try:
                lat = float(lat)
                lon = float(lon)
            except (ValueError, TypeError):
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Invalid latitude or longitude values'
                }, status=400)
            
            print(f"Received request: lat={lat}, lon={lon}, type={breakdown_type}, offset={offset}, limit={limit}")

            mechanics_df = get_top_mechanics(lat, lon, breakdown_type, offset, limit)
            
            # Add debugging
            if mechanics_df.empty:
                print("No mechanics found in DataFrame")
                return JsonResponse({'status': 'success', 'mechanics': []})
            
            mechanics_df = mechanics_df.where(pd.notnull(mechanics_df), None)
            mechanic_list = mechanics_df.to_dict(orient='records')

            print(f"Returning {len(mechanic_list)} mechanics")
            return JsonResponse({'status': 'success', 'mechanics': mechanic_list})
            
        except Exception as e:
            print(f"Error in get_mechanics: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return JsonResponse({
                'status': 'error', 
                'message': str(e),
                'details': traceback.format_exc()
            }, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)
