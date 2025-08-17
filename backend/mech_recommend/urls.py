from django.urls import path
from . import views

urlpatterns = [
    path('api/recommendations/', views.get_mechanics, name='get_mechanics'),
    path('api/service-request/', views.create_service_request, name='create_service_request'),
    path('api/accept-request/', views.mechanic_accept_request, name='mechanic_accept_request'),
    path('api/pending-requests/', views.get_pending_requests, name='get_pending_requests'),
]
