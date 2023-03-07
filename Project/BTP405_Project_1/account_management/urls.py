from django.urls import path
from . import views

urlpatterns = [
    path('', views.members),
    path('register/', views.register, name='register'),
    path(r'api/username/', views.usernameunique, name='usernameunique'),
    path(r'api/email/', views.emailunique, name='emailunique'),
    path('login/', views.login, name='login'),
    path(r'api/loginU/', views.usernamelogin, name='loginUsename'),
    path(r'api/loginE/', views.emaillogin, name='loginEmail'),
    path('reset/', views.reset, name='reset'),
    path(r'api/sendcode/', views.sendcode, name='sendcode'),
    path(r'api/matchcode/', views.matchcode, name='matchcode'),
    path('resetpassword/', views.resetpassword, name='resetpassword'),
    path(r'api/resetpassword/', views.updatepassword, name='updatepassword'),
    path('admin/', views.admin, name="admin")
]
