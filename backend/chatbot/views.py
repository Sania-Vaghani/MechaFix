from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .chatbot_engine import get_bot_response

@csrf_exempt
def chatbot_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get("message", "")
            if not user_message:
                return JsonResponse({"reply": "Please enter a message."}, status=400)

            bot_reply = get_bot_response(user_message)
            print("Bot reply to frontend:", bot_reply)
            return JsonResponse({"reply": bot_reply})
        except Exception as e:
            print("Chatbot error: ",e)
            return JsonResponse({"error": str(e)}, status=500)
    elif request.method == "GET":
        return JsonResponse({"message": "Chatbot endpoint is working. Use POST to chat."})
    return JsonResponse({"error": "Method not allowed"},status=405)