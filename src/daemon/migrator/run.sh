#!/bin/bash

if [ $USE_DEV_MODE = "true" ];
  then nodemon --exec python -u main.py $POLLING_FREQ $RABBITMQ_DEFAULT_VHOST $ROUTING_KEY_ENTITY_IMPORT;
  else python -u main.py $POLLING_FREQ $RABBITMQ_DEFAULT_VHOST $ROUTING_KEY_ENTITY_IMPORT;
fi