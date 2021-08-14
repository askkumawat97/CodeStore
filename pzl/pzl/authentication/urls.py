from django.contrib import admin
from django.urls import path, include
from authentication import views

urlpatterns = [
    path('', views.home, name="home"),
    path('main', views.main, name="main"),
    path('signup', views.handleSignUp, name="handleSignUp"),
    path('login', views.handeLogin, name="handleLogin"),
    path('logout', views.handelLogout, name="handleLogout"),

    path('refresh', views.refresh, name="refresh"),
    path('buyCoins', views.buyCoins, name="buyCoins"),
    path('friendRequest', views.friendRequest, name="friendRequest"),
    path('forGame', views.forGame, name="forGame"),

    path('paymentGatway', views.paymentGatway, name="paymentGatway"),
    path('paymentStatus', views.paymentStatus, name="paymentStatus"),
    
    #path('kill_background_task', views.kill_background_task, name="kill_background_task"),
	path('show', views.show, name="show"),
]
