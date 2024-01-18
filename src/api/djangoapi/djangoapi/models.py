from django.db import models

class Sighting(models.Model):
    id = models.CharField(max_length=250, primary_key=True)
    ufo_shape_ref = models.CharField(max_length=250)
    date_encounter = models.CharField(max_length=250)
    time_encounter = models.CharField(max_length=250)
    season_encounter = models.CharField(max_length=250)
    date_documented = models.CharField(max_length=250)
    country = models.CharField(max_length=250)
    region = models.CharField(max_length=250)
    locale = models.CharField(max_length=250)
    location_geometry = models.CharField(max_length=250)
    encounter_duration_text = models.CharField(max_length=250)
    encounter_duration_seconds = models.IntegerField()
    description = models.CharField(max_length=250)
    created_on = models.DateTimeField()
    updated_on = models.DateTimeField()
