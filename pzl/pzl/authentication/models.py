from django.db import models

# Create your models here.
class Store(models.Model):
	user_id = models.AutoField(primary_key=True)
	userName = models.CharField(max_length = 30)
	
	coins = models.IntegerField(default = 1000)
	score = models.IntegerField(default = 0)
	time = models.IntegerField(default = 0)
	
	notification = models.TextField(null=True,default='')
	partners = models.TextField(null=True,default='') #""=free, ",1,2,3"=partners list
	
	requestTo = models.TextField(null=True,default='')
	requestFrom = models.TextField(null=True,default='')
	
	
	flag = models.IntegerField(default = 0) #used for testing purpose
	
	
	class Meta:
		db_table = "Store"
