#!/bin/bash

if [ $USE_DEV_MODE = "true" ];
  then nodemon --exec python -u main.py $NUM_XML_PARTS;
  else python -u main.py $NUM_XML_PARTS;
fi