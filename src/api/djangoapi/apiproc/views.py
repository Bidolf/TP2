from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def db_available_files_add():
    files = {'file_name':'subxml_autumn'}
    return Response(files)