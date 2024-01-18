from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Sighting
from .serializers import SightingSerializer

@api_view(['GET'])
def getSightings(request):
    sightings = Sighting.objects.all()
    serializer = SightingSerializer(sightings, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def patchSighting(request, pk):
    sighting = Sighting.objects.get(id=pk)
    serializer = SightingSerializer(instance=user, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)