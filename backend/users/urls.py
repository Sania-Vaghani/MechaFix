from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('api/users/google-login/', views.google_login),
    path('create-password/', views.create_password, name='create_password'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('me/', views.user_me, name='user_me'),
    path('mech/update-availability/', views.update_mechanic_availability, name='update_mechanic_availability'),
]