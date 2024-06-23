from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect,JsonResponse,HttpResponseBadRequest
from django.shortcuts import render
from django.urls import reverse
from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import os
import json
from .models import User,Post,Like,Follows


def index(request):
    return render(request, "network/index.html")

@csrf_exempt
def get_csrf(request):
    return JsonResponse({
        "csrf_token":request.META["CSRF_COOKIE"]
    })

def posts(request):
    if request.method == "POST":
        if 'image' in request.FILES:
            post = Post(body=request.POST["body"],creator=request.user)
            img = request.FILES["image"]
            file_path = os.path.join(settings.MEDIA_ROOT,"network/postImage")
            if not os.path.exists(file_path):
                    os.makedirs(file_path)
            file_path = os.path.join(file_path,img.name)
            try:
                with default_storage.open(file_path,"wb+") as distination:
                    for chunk in img.chunks():
                        distination.write(chunk)
                post.image = os.path.join(settings.MEDIA_URL,os.path.join("network/postImage",img.name))
                post.save()
                return HttpResponseRedirect(reverse(index))
            except Exception as e:
                return HttpResponseBadRequest("Failed to upload image: " + str(e))
        else:
            post = Post(body=request.POST["body"],creator=request.user,image="")
            post.save()
            return HttpResponseRedirect(reverse(index))
    postings = Post.objects.order_by("-date")[int(request.GET.get("start")):int(request.GET.get("end")) + 1]
    return JsonResponse({"postings": [posting.serialize(request.user.pk) for posting in postings]})
def get_posts_count(request):
    return JsonResponse({"count":Post.objects.all().count()})
@login_required
def get_followed(request):
    if request.user.following.count():
        print([ user for user in request.user.following.all()])
        return JsonResponse({
            "message": request.user.following.count()
        })
@login_required
def follow(request):
    if request.method != "POST":
        return HttpResponseBadRequest("page not found")
    try:
        data = json.loads(request.body.decode('utf-8'))
        user = User.objects.filter(email=data.get("followed")).first()
        if user is None:
            return JsonResponse({"message": "User not found"}, status=404)
        if Follows.objects.filter(follower=request.user,followed=user).exists():
            Follows.objects.filter(follower=request.user,followed=user).delete()
            return JsonResponse({
            "message": "unfollowed"
            })
        else:
            follows = Follows(follower=request.user,followed=user)
            follows.save()
            return JsonResponse({
                "message": "followed"
            })
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid Json data")
@login_required
def like(request):
    if request.method != "POST":
        return HttpResponseBadRequest()
    data = json.loads(request.body)
    post_id = data.get('post_id')
    if Like.objects.filter(post=Post.objects.filter(pk=post_id).first(),user=request.user).count() == 0:
        llike = Like.objects.create(post=Post.objects.filter(pk=post_id).first(),user=request.user)
        llike.save()
    else:
        llike = Like.objects.filter(post=Post.objects.filter(pk=post_id).first(),user=request.user).first().delete()
    return JsonResponse({
        "message" : "success"
    })

def get_user(request,user_id):
    if User.objects.filter(pk=user_id).count == 0:
        return HttpResponseBadRequest()
    user = User.objects.all().filter(pk=user_id).first()
    print(user.posts.all())
    if request.user.is_authenticated:
        print(Follows.objects.filter(follower=request.user,followed=user).exists())
        return JsonResponse({
        "username":user.username,
        "email": user.email,
        "date_joined":user.date_joined,
        "image": user.user_img.name,
        "posts": [posting.serialize(request.user.pk) for posting in user.posts.order_by("-date").all()],
        "followers": user.followers.all().count(),
        "following": user.following.all().count(),
        "followed": Follows.objects.filter(follower=request.user,followed=user).exists()
        })
    else:
        return JsonResponse({
        "username":user.username,
        "email": user.email,
        "date_joined":user.date_joined,
        "image": user.user_img.name,
        "posts": [posting.serialize(request.user.pk) for posting in user.posts.order_by("-date").all()],
        "followers": user.followers.all().count(),
        "following": user.following.all().count(),
        "notLoggedIn": True
        })
    
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")