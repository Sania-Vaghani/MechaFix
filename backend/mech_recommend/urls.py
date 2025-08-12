from django.urls import path
from . import views

urlpatterns = [
    path('api/recommendations/', views.get_mechanics, name='get_mechanics'),
]
