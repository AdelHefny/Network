from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    user_img = models.ImageField(upload_to="network/userImages",default=f"{settings.MEDIA_URL}network/userImages/default_user.png")
    pass
class Post(models.Model):
    body = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="network/postImage",default=f"{settings.MEDIA_URL}/network/postImage/default-placeholder.jpg")
    creator =  models.ForeignKey(User,on_delete=models.CASCADE,related_name="posts")
    def serialize(self,user_id):
        return {
            "id": self.pk,
            "body": self.body,
            "likes": self.likes.count(),
            "liked": self.likes.filter(user=User.objects.filter(pk=user_id).first()).all().count() > 0,
            # 2015-03-25T12:00:00-06:30
            "date": self.date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "creator": {
                "id": self.creator.pk,
                "username": self.creator.username,
                "image": self.creator.user_img.name
            },
            "image": self.image.name,
        }
class Comment(models.Model):
    body = models.TextField()
    date = models.DateField(auto_now_add=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="comments")
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name="comments")
class Like(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name="likes")
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="likes")
class Follows(models.Model):
    follower = models.ForeignKey(User,on_delete=models.CASCADE,related_name="following")
    followed = models.ForeignKey(User,on_delete=models.CASCADE,related_name="followers")