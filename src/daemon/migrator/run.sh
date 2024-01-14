#!/bin/bash

OUTPUT_BIN="main"

go mod init migrator
go get github.com/lib/pq
go get github.com/rabbitmq/amqp

# Check if not in dev mode
if [ "$USE_DEV_MODE" != "true" ]; then
  go build -o $OUTPUT_BIN main.go
fi

# Execute the project
if [ "$USE_DEV_MODE" = "true" ]; then
  nodemon --exec go run main.go "$POLLING_FREQ" "$RABBITMQ_DEFAULT_VHOST" "$ROUTING_KEY_ENTITY_IMPORT" "$RABBITMQ_DEFAULT_USER" "$RABBITMQ_DEFAULT_PASS";
else
  ./$OUTPUT_BIN
fi