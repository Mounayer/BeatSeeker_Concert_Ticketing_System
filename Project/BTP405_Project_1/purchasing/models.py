import django.db.models
from django.db import models

# Create your models here.

class Ticket(models.Model):
    name = models.CharField(max_length=50)
    price = models.DecimalField(decimal_places=2, max_digits=6)
    def __str__(self):
        return self.name