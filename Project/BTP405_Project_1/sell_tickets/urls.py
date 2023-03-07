from django.urls import path
from . import views

urlpatterns = [
    path('', views.selltickets, name='selltickets'),
    path(r'api/sellrequest/', views.requestToSellConcert, name='requesttosellconcert'),
    path(r'api/nextrequestid/', views.getNextRequestId, name='getnextrequestid'),
    path(r'api/allrequests', views.getAllRequests, name='getallrequests'),
    path(r'api/requestbyid/', views.getRequestByID, name='getrequestbyid'),
    path(r'api/openrequest/', views.requestIsOpened, name='openrequest'),
    path(r'api/deleterequest/', views.DeleteRequest, name='deleterequest'),

]
