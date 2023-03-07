from django.urls import path
from . import views

urlpatterns = [
    path('api/create-payment-intent/', views.create_payment),
    path('api/get-counter/', views.getPaymentCounter),
    path('api/set-counter/', views.setPaymentCounter),
    path('api/set-email/', views.setSessionEmail),
    path('api/blockPayment/', views.blockPayment),
    path('<int:id>', views.pay),
    path('details/<int:id>', views.paymentDetails),
    path('lang/', views.lang),
    path('submitted/', views.paymentSubmitted),
    path('api/pay', views.payUsingCardData),
    path('api/payment_details', views.specifyPaymentDetails),
]