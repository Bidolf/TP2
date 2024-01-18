from django.db import models


class XmlFile(models.Model):
    id = models.CharField(max_length=250, primary_key=True)
    file_name = models.CharField(max_length=250)
    active = models.BooleanField()
    scanned = models.BooleanField(default=False)
    created_on = models.DateTimeField()
    updated_on = models.DateTimeField()
    deleted_on = models.DateTimeField()

    def __str__(self):
        return self.file_name

    class Meta:
        db_table = 'imported_documents'


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
    latitude = models.FloatField()
    longitude = models.FloatField()
    encounter_duration_text = models.CharField(max_length=250)
    encounter_duration_seconds = models.IntegerField()
    description = models.CharField(max_length=250)
    created_on = models.DateTimeField()
    updated_on = models.DateTimeField()
