from django.urls import path
from . import views

urlpatterns = [
    path('', views.user, name='user'),
    path('api/userinfo', views.userinfo, name='userinfo'),
    path('logout/', views.logout_user, name='logout'),
    path('api/logged/', views.isLoggedIn, name='isLoggedIn'),
    path('api/update', views.update_user),
    path('api/card/', views.get_user_credit_card),
    path('api/tickets/', views.getPurchaseInfo, name='purchaseinfo'),
    path('tickets/<int:id>', views.tickets, name='tickets'),
    path('api/user_card/', views.user_payment_info)
]