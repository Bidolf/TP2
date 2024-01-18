from django.urls import path
from . import views

urlpatterns = [
    path ('getall', views.getSightings),
    path ('tile/<str:pk>', views.getSightingsInArea),
    path ('entity/<str:pk>', views.patchSighting),
]