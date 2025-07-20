from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .recommendation import get_top_mechanics  # 👈 import from your model file

@csrf_exempt
def get_mechanics(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lat = float(data.get("lat"))
            lon = float(data.get("lon"))
            breakdown_type = data.get("breakdown_type", "engine")

            top5_df = get_top_mechanics(lat, lon, breakdown_type)
            top5_list = top5_df.to_dict(orient='records')

            return JsonResponse({'status': 'success', 'mechanics': top5_list})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)
