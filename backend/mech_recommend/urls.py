from django.urls import path
from . import views

urlpatterns = [
    path('api/recommendations/', views.get_mechanics, name='get_mechanics'),
    path('api/service-request/', views.create_service_request, name='create_service_request'),
    path('api/accept-request/', views.mechanic_accept_request, name='mechanic_accept_request'),
    path('api/pending-requests/', views.get_pending_requests, name='get_pending_requests'),
    path('api/assigned-requests/', views.get_assigned_requests, name='get_assigned_requests'),
    path('api/mechanic-reject/', views.mechanic_reject_request, name='mechanic_reject_request'),
    path('api/request-detail/<str:request_id>/', views.get_service_request_detail, name='get_service_request_detail'),
    path('service-requests/<str:req_id>/assign-mechanic/', views.assign_mechanic, name='assign_mechanic'),
    path('api/assign-worker/', views.assign_worker, name='assign_worker'),
    path('api/user-active-request/', views.get_user_active_request, name='get_user_active_request'),
    path('api/verify-otp-complete/', views.verify_otp_and_complete, name='verify_otp_complete'),
    path('api/mechanics/', views.get_mechanics_list, name='get_mechanics_list'),
    path('api/service-requests/today-overview/', views.get_today_overview, name='get_today_overview'),
    path('api/service-requests/recent/', views.get_recent_requests, name='get_recent_requests'),

    path('api/service-requests/completed/', views.get_completed_requests, name='get_completed_requests'),
    path('api/submit-rating/', views.submit_rating, name='submit_rating'),
]