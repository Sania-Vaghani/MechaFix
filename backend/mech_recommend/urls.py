from django.urls import path
from .views import get_mechanics

urlpatterns = [
    path("recommendations/", get_mechanics),
]
