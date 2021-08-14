from django.shortcuts import render, HttpResponse, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth  import authenticate, login, logout

import re
import pika
import json
import threading

from .models import Store

#from background_task import background
#from background_task.models import Task

class col:
	BLUE = '\033[95m'
	DARKBLUE = '\033[35m'
	MAGINTA = '\033[94m'
	DARKMAGINTA = '\033[34m'
	GREEN = '\033[92m'
	RED = '\033[91m'
	ENDC = '\033[0m'




'''
def kill_background_task():
	background_tasks = Task.objects.filter(task_name='pzl.background_tasks.paymentGatway')
	for background_task in background_tasks:
		background_task.delete()
	background_tasks = Task.objects.filter(task_name='pzl.background_tasks.paymentStatus')
	for background_task in background_tasks:
		background_task.delete()
'''

def runThread():
	thread1 = threading.Thread(target=paymentGatway,args=[])
	thread1.setDaemon(True)
	thread1.start()

	thread2 = threading.Thread(target=paymentStatus,args=[])
	thread2.setDaemon(True)
	thread2.start()


#@background(schedule=1)
def paymentGatway():
	connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
	channel = connection.channel()
	channel.queue_declare(queue='queue1')

	def callback(ch, method, properties, body):
		jsonObj = json.loads(body)
		username = jsonObj['name']
		price = jsonObj['price']

		print( col.MAGINTA + "PaymentGatway received payment request, via Queue1: " + col.DARKMAGINTA + "%r" % jsonObj + col.ENDC )
		#ch.basic_ack(delivery_tag = method.delivery_tag)

		connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
		channel = connection.channel()
		channel.queue_declare(queue='queue2')

		#updating flag
		user = Store.objects.get( userName = username )
		user.flag = user.flag + 1
		user.save()

		msgData = {}
		if( user.flag % 2 == 0 ):
			msgData = { "request": jsonObj['request'], "name":jsonObj['name'], "price": jsonObj['price'], "status":"payment failed" }
		else:
			msgData = { "request": jsonObj['request'], "name":username, "price":price, "status":"payment confirmed" }

		channel.basic_publish(exchange='',
							routing_key='queue2',
							body=json.dumps(msgData),
							properties=pika.BasicProperties(
								delivery_mode = 2, # make message persistent
							))
		print( col.BLUE + "PaymentGatway sent payment status to PaymentStatus, via Queue2" + col.ENDC )
		connection.close()

	channel.basic_consume(queue='queue1', on_message_callback=callback, auto_ack=True)
	print('Queue1 waiting for messages')
	channel.start_consuming()




#@background(schedule=1)
def paymentStatus():
	connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
	channel = connection.channel()
	channel.queue_declare(queue='queue2')

	def callback(ch, method, properties, body):
		jsonObj = json.loads(body)
		print( col.BLUE + "PaymentStatus received payment status, via Queue2: " + col.DARKBLUE + "%r" % jsonObj + col.ENDC )

		if(jsonObj['status'] == "payment confirmed"):
			print( col.GREEN + "Payment status: confirmed" + col.ENDC )
			store = Store.objects.get( userName = jsonObj['name'] )
			store.coins = store.coins + int(jsonObj['price']) * 100
			store.save()
			#store notifications in database
			store.notif = jsonObj['price']
			store.notification = 'Payment_success'
			store.save()

		else:
			print( col.RED + "Payment status: failed" + col.ENDC )
			store = Store.objects.get( userName = jsonObj['name'] )
			#store notifications in database
			store.notif = -1
			store.notification = 'Payment_failed'
			store.save()

	channel.basic_consume(queue='queue2', on_message_callback=callback, auto_ack=True)
	print('Queue2 waiting for messages')
	channel.start_consuming()




#kill_background_task()
#paymentGatway()
#paymentStatus()



def show(request):
	return HttpResponse( 'show() is working!' )


def friendRequest(request):
	userAction = request.POST.get('action')
	userName = request.POST.get('user')
	friendId = request.POST.get('friendId')
	timeTaken = request.POST.get('time')
	
	if( userAction == "send" ):
		userStore = Store.objects.get( userName = userName )
		userStore.requestTo += ',' + friendId
		userStore.save()

		friendStore = Store.objects.get( user_id = friendId )
		friendStore.requestFrom += ',' + str(userStore.user_id)
		friendStore.save()

	elif( userAction == "cancle" ):
		userStore = Store.objects.get( userName = userName )

		newStr = userStore.requestTo
		newStr = newStr.split(",")
		for ele in newStr:
			if ele == str( friendId ):
				newStr.remove(ele)
		newStr = ','.join( str(e) for e in newStr )

		userStore.requestTo = newStr
		userStore.save()
		
		
		friendStore = Store.objects.get( user_id = friendId )

		newStr = friendStore.requestFrom
		newStr = newStr.split(",")
		for ele in newStr:
			if ele == str( userStore.user_id ):
				newStr.remove(ele)
		newStr = ','.join( str(e) for e in newStr )

		friendStore.requestFrom = newStr
		friendStore.save()

	elif( userAction == "accept" ):
		userStore = Store.objects.get( userName = userName )
		userStore.partners = "," + str(friendId)
		#userStore.requestTo = ""
		#userStore.requestFrom = ""
		userStore.save()

		friendStore = Store.objects.get( user_id = friendId )
		friendStore.partners += "," + str(userStore.user_id)
		#friendStore.requestTo = ""
		#friendStore.requestFrom = ""
		friendStore.save()
	
	elif( userAction == "timeTaken" ):
		userStore = Store.objects.get( userName = userName )
		friendStore = Store.objects.get( user_id = friendId )
		timeTaken = int( timeTaken )
		
		if( userStore.time == 0 ): #you win
			userStore.time = timeTaken
			friendStore.time = timeTaken
			userStore.save()
			friendStore.save()
			
		elif( userStore.time != 0 ): #compare time
			msg = ''
			if( timeTaken < userStore.time ): #you win
				userStore.notification = 'Won'
				friendStore.notification = 'Lost'
				userStore.coins += 1000
				friendStore.coins -= 1000
			else: #you lost
				userStore.notification = 'Lost'
				friendStore.notification = 'Won'
				userStore.coins -= 1000
				friendStore.coins += 1000
				
			userStore.time = 0
			friendStore.time = 0
			userStore.save()
			friendStore.save()

	return HttpResponse('friendRequest() updated')


def forGame(request):
	action = request.POST.get('action')
	userName = request.POST.get('user')
	res = ''
	if( action == "initGame" ):
		res = '4,1,2,7,9,3,8,5,6'
		#res = '1,2,3,4,5,6,7,9,8'
	else:
		userStore = Store.objects.get( userName = userName )
		userStore.partners = ""
		userStore.time = 0
		userStore.save()
		res = 'game leaved'

	return HttpResponse( res )


def refresh(request):
	userName = request.POST.get('user')
	openedArea = request.POST.get('openedArea')
	#print( "name:", userName, ", id:", userId, "openedArea:", openedArea );

	#Insert
	#store = Store( userName = userName )
	#store.save()

	#Update
	#store = Store.objects.get( userName = userName )
	#store.coins += 100
	#store.save()
	
	
	#clear requests
	#userStore = Store.objects.get( userName = userName )
	#userStore.requestTo = ''
	#userStore.requestFrom = ''
	#userStore.partners = ''
	#userStore.time = 0
	#userStore.save()
	
	#Select
	user = Store.objects.get( userName = userName )
	
	res = '{ '
	res += '"user_id": ' + str( user.user_id )
	res += ', "coins": ' + str( user.coins )
	res += ', "score": ' + str( user.score )
	res += ', "time": ' + str( user.time )
	res += ', "flag": ' + str( user.flag )
	res += ', "notification": "' + user.notification + '"'
	res += ', "partners": "' + user.partners + '"'

	if openedArea == "board":
		res += ', "requestTo": "' + user.requestTo + '"'
		res += ', "requestFrom": "' + user.requestFrom + '"'

		usersList = '[ '
		otherUsers = Store.objects.all()
		for ele in otherUsers:
			usersList += '[' + str(ele.user_id) + ', "' + ele.userName + '", "' + ele.partners + '" ], '
		usersList += '[] ]'
		res += ', "users": ' + usersList

	res += ' }'
	
	if user.notification != "":
		user.notification = ""
		user.save()
	
	return HttpResponse( res )




def buyCoins(request):
	userName = request.POST.get('user')
	price = request.POST.get('price')

	connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
	channel = connection.channel()
	channel.queue_declare(queue='queue1')

	msgData = { "request": request.META.get('HTTP_REFERER'), "name": userName, "price": price }
	channel.basic_publish(exchange='',
						routing_key='queue1',
						body=json.dumps(msgData),
						properties=pika.BasicProperties(
							delivery_mode = 2, # make message persistent
						))
	print( col.MAGINTA + "sent payment request to PaymentGatway, via Queue1" + col.ENDC )
	connection.close()

	return HttpResponse( 'processing payment' )







def home(request):
	if request.user.is_authenticated:
		return render(request, 'main.html')
	else:
		return render(request, 'home.html')

def main(request):
	if request.user.is_authenticated:
		return render(request, 'main.html')
	else:
		return render(request, 'home.html')


def handleSignUp(request):
	if request.method=="POST":
		# Get the post parameters
		username=request.POST['username']
		email=request.POST['email']
		fname=request.POST['fname']
		lname=request.POST['lname']
		pass1=request.POST['pass1']
		pass2=request.POST['pass2']

		# check for errorneous input
		EMAIL_REGIX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-copyZ0-9._-]+\.[a-zA-Z]+$')

		if not EMAIL_REGIX.match(request.POST["email"]):
			return HttpResponse('invalid_email')
			#messages.error(request, " invalid email fromat! ex: test@test.com")
			#return redirect('home')

		if User.objects.filter(username=request.POST["username"]).count() > 0:
			return HttpResponse('username_exist')
			#messages.error(request, " A user with this name already exists!")
			#return redirect('home')

		if User.objects.filter(email=request.POST["email"]).count() > 0:
			return HttpResponse('user_email_exist')
			#messages.error(request, "A user with this email already exixts!")

		if len(username)>10:
			return HttpResponse(request, " Your user name must be under 10 characters")
			#messages.error(request, " Your user name must be under 10 characters")
			#return redirect('home')

		if not username.isalnum():
			return HttpResponse(request, " User name should only contain letters and numbers")
			#messages.error(request, " User name should only contain letters and numbers")
			#return redirect('home')

		if (pass1!= pass2):
			return HttpResponse('password_must_match')
			 #messages.error(request, " Passwords do not match")
			 #return redirect('home')


		# Create the user
		myuser = User.objects.create_user(username, email, pass1)
		myuser.first_name= fname
		myuser.last_name= lname
		myuser.save()
		
		#insert user into Store table
		store = Store( userName = username )
		store.save()
	
		#messages.success(request, " your account is successfully created")
		return redirect('home')

	else:
		return HttpResponse("404 - Not found")


def handeLogin(request):
	if request.method=="POST":
		# Get the post parameters
		loginusername=request.POST['loginusername']
		loginpassword=request.POST['loginpassword']

		user=authenticate(username= loginusername, password= loginpassword)
		if user is not None:
			login(request, user)
			
			#clear requests
			userStore = Store.objects.get( userName = loginusername )
			userStore.requestTo = ''
			userStore.requestFrom = ''
			userStore.partners = ''
			userStore.time = 0
			userStore.save()
	
			#messages.success(request, "Successfully Logged In")
			return redirect("main")
		else:
			return HttpResponse('invalid_credentials')
			#messages.error(request, "Invalid credentials! Please try again")
			#return redirect("home")
	else:
		return HttpResponse("404- Not found")
		return HttpResponse("login")

def handelLogout(request):
	logout(request)
	#messages.success(request, "Successfully logged out")
	return redirect('home')



runThread()
