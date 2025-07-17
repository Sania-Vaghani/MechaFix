from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('create-password/', views.create_password, name='create_password'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('me/', views.user_me, name='user_me'),
]
