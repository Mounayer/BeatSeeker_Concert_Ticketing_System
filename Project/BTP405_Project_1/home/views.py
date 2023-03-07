from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
import json
import os.path


def home(request):
    template = loader.get_template("home.html")

    return HttpResponse(template.render())

def error_404(request, exception):
    return render(request, '404.html')
