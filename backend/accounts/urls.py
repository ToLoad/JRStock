from django.urls import include, path
from . import views

login_patterns = [
    path('normal/', views.login, name='login'),
    path('google/', views.google_login, name='google_login'),
    path('google/finish/', views.GoogleLogin.as_view(),
        name='google_login_todjango'),
]

urlpatterns = [
    path('create/', views.signup, name='signup'),
    path('detail/', views.user_detail, name='user_detail'),
    path('', views.user_list, name='user_list'),
    path('password-check/', views.password_check, name='password_check'),
    path('password-reset/', views.password_reset, name='password_reset'),
    path('update/<int:pk>', views.user_update, name='user_update'),
    path('delete/<int:pk>', views.user_delete, name='user_delete'),
    path('login/', include(login_patterns)),
    path('email-confirm/<str:uidb64>/<str:token>', views.email_confirm, name='email_confirm'),
    path('email-check/<str:email>', views.email_check, name='email_check'),
    
    path('contact/', views.send_contact_mail, name='send_contact_mail'),
]