import json
import re
import random
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import connection
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.core.cache import cache
import jwt
from django.conf import settings
from django.db import connection

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        phone = data.get('phone')
        user_type = data.get('user_type')

        if not username or not email or not phone or not user_type:
            return JsonResponse({'error': 'All fields required'}, status=400)

        if not is_valid_email(email):
            return JsonResponse({'error': 'Invalid email format'}, status=400)

        # Optionally, check for existing email/phone in both collections
        db = connection.cursor().db_conn
        if db['auth_users'].find_one({'email': email}) or db['auth_mech'].find_one({'email': email}):
            return JsonResponse({'error': 'Email already exists'}, status=400)
        if db['auth_users'].find_one({'phone': phone}) or db['auth_mech'].find_one({'phone': phone}):
            return JsonResponse({'error': 'Phone already exists'}, status=400)

        # Generate OTP
        otp = str(random.randint(1000, 9999))

        # Send OTP via Email
        try:
            subject = "Your MechaFix OTP"
            message = f"Your MechaFix OTP is: {otp}"
            recipient_list = [email]
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)
        except Exception as e:
            return JsonResponse({'error': f'Failed to send OTP: {str(e)}'}, status=500)

        # After sending OTP email
        cache.set(f"otp_{email}", otp, timeout=300)  # 5 minutes

        return JsonResponse({'message': 'OTP sent to your email!'}, status=200)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print("Received login data:", data)
        user_type = data.get('user_type')
        password = data.get('password')
        phone = data.get('phone')
        username = data.get('username')  # this is email for email login

        if not password or not user_type or (not phone and not username):
            return JsonResponse({'error': 'All fields required'}, status=400)

        db = connection.cursor().db_conn
        collection_name = 'auth_users' if user_type == 'user' else 'auth_mech'

        # Build query for phone or email/username
        query = {}
        if phone:
            query['phone'] = phone
        elif username:
            # Try both email and username fields for flexibility
            if is_valid_email(username):
                query['email'] = username
            else:
                query['username'] = username

        user = db[collection_name].find_one(query)

        if not user:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)

        # Check password using Django's hasher
        if not check_password(password, user.get('password', '')):
            return JsonResponse({'error': 'Invalid credentials'}, status=400)

        # Generate JWT token
        import jwt
        payload = {'username': user.get('username'), 'user_type': user_type}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return JsonResponse({'token': token, 'user_type': user_type})

@csrf_exempt
def create_password(request):
    print("create_password called")
    if request.method == 'POST':
        data = json.loads(request.body)
        print("Data received:", data)
        username = data.get('username')
        email = data.get('email')
        phone = data.get('phone')
        user_type = data.get('user_type')
        password = data.get('password')

        if not all([username, email, phone, user_type, password]):
            return JsonResponse({'error': 'All fields required'}, status=400)

        hashed_password = make_password(password)
        db = connection.cursor().db_conn
        collection = 'auth_users' if user_type == 'user' else 'auth_mech'

        # Check if user already exists
        if db[collection].find_one({'email': email}):
            return JsonResponse({'error': 'User already exists'}, status=400)

        # Insert new user
        db[collection].insert_one({
            'username': username,
            'email': email,
            'phone': phone,
            'password': hashed_password
        })

        return JsonResponse({'message': 'User created successfully!'})

from django.core.cache import cache

@csrf_exempt
def verify_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        entered_otp = data.get('otp')
        email = data.get('email')

        cached_otp = cache.get(f"otp_{email}")
        if not cached_otp:
            return JsonResponse({'error': 'OTP expired or not found. Please request a new one.'}, status=400)
        if entered_otp != cached_otp:
            return JsonResponse({'error': 'OTP mismatch. Try again.'}, status=400)

        # OTP is correct, delete it
        cache.delete(f"otp_{email}")
        return JsonResponse({'message': 'OTP verified successfully!'})
    
@csrf_exempt
def user_me(request):
    if request.method == 'GET':
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except Exception as e:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        user_type = payload.get('user_type')
        username = payload.get('username')
        db = connection.cursor().db_conn
        collection = 'auth_users' if user_type == 'user' else 'auth_mech'
        user = db[collection].find_one({'username': username})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        # Remove sensitive info
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        return JsonResponse(user)
    return JsonResponse({'error': 'GET required'}, status=405)