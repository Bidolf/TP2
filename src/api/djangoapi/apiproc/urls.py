from django.urls import path
from . import views

urlpatterns = [
    path('', views.db_available_files_add),
]