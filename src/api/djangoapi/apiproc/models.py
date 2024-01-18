from django.db import models
from ..djangoapi.models import Sighting

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


