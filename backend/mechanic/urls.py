from django.urls import path
from . import views
 
urlpatterns = [
    path('workers/', views.workers, name='workers'),
    path('workers/<str:worker_id>/', views.worker_detail, name='worker_detail'),
] 