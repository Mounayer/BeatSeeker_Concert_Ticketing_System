from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('concert/', include('concert_management.urls')),
    path('', include('home.urls')),
    path('payment/', include('purchasing.urls')),
    path('user/', include('user_profile.urls')),
    path('account/', include('account_management.urls')),
    path('selltickets/', include('sell_tickets.urls')),
    path('admin/', admin.site.urls),
]

handler404 = 'home.views.error_404'
