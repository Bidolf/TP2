#!/bin/bash

npm install;
npm install prisma
npx prisma generate; # Run prisma generate to generate the Prisma Client. You can then start querying your database.

if [ "$USE_DEV_MODE" = "true" ];
  then npm run start:dev;
  else npm run start;
fi