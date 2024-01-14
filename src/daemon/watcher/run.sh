#!/bin/bash

OUTPUT_BIN="main"

go mod init migrator
go get github.com/jackc/pgx
go get github.com/streadway/amqp091-go

# Check if not in dev mode
if [ "$USE_DEV_MODE" != "true" ]; then
  go build -o $OUTPUT_BIN main.go
fi

# Execute the project
if [ "$USE_DEV_MODE" = "true" ]; then
  nodemon --exec go run main.go "$RABBITMQ_DEFAULT_USER" "$RABBITMQ_DEFAULT_PASS" "$RABBITMQ_DEFAULT_VHOST" "$ROUTING_KEY_ENTITY_IMPORT" "$ROUTING_KEY_GEO_DATA_UPDATE" "$POLLING_FREQ";
else
  ./$OUTPUT_BIN
fi
