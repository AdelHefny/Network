
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("follow",views.follow,name="follow"),
    path("getFollowed",views.get_followed,name="getFollowed"),
    path("getCsrf",views.get_csrf,name="getCsrf"),
    path("posts",views.posts,name="posts"),
    path("postsCount",views.get_posts_count,name="posts_count"),
    path("like",views.like,name="like"),

    path("user/<int:user_id>",views.get_user,name="get_user")
]
