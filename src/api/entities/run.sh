#!/bin/bash

npm install
npm install prisma
npx prisma generate

if [ "$USE_DEV_MODE" = "true" ];
  then npm run start:dev;
  else npm run start;
fi