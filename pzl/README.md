

##https://www.rabbitmq.com/tutorials/tutorial-one-python.html


#### RABBITMQ ####
required erlang
> sudo apt-get install rabbitmq-server

> service rabbitmq-server start
> service rabbitmq-server stop
> service rabbitmq-server restart
> service rabbitmq-server status

> sudo rabbitmqctl list_queues
> sudo rabbitmqctl purge_queue queue_name
> sudo rabbitmqctl delete_queue queue_name


#### PYTHON ####
> pip3 install pika
> sudo apt-get upgrade


#### DJANGO ####
> django-admin startproject pzl
> cd pzl
> django-admin startapp authentication
> python3 manage.py makemigrations
> python3 manage.py migrate
> python3 manage.py createsuperuser




#### RUNNING APP ####

> service rabbitmq-server start

> cd .../pzl
> python3 manage.py runserver


## BROWSER:
http://localhost:8000/


## ADMIN CREDENTIALS:
username: admin
password: admin



