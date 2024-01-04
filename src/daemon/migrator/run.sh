#!/bin/bash

if [ $USE_DEV_MODE = "true" ];
  then nodemon --exec python -u main.py $POLLING_FREQ $RABBITMQ_DEFAULT_VHOST ;
  else python -u main.py $POLLING_FREQ $RABBITMQ_DEFAULT_VHOST;
fi