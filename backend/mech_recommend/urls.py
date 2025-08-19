from django.urls import path
from . import views

urlpatterns = [
    path('api/recommendations/', views.get_mechanics, name='get_mechanics'),
    path('api/service-request/', views.create_service_request, name='create_service_request'),
    path('api/accept-request/', views.mechanic_accept_request, name='mechanic_accept_request'),
    path('api/pending-requests/', views.get_pending_requests, name='get_pending_requests'),
    path('api/mechanic-reject/', views.mechanic_reject_request, name='mechanic_reject_request'),  
    path('api/request-detail/<str:request_id>/', views.get_service_request_detail, name='get_service_request_detail'),
    path('api/assign-worker/', views.assign_worker, name='assign_worker'),
    path('api/assigned-requests/', views.get_assigned_requests, name='get_assigned_requests'),
]
