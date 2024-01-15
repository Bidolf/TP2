package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
	"database/sql"

	amqp "github.com/rabbitmq/amqp091-go"
	_ "github.com/lib/pq"
)

var (
	rabbitVHost            = os.Args[2]
	pollingFrequency, _    = strconv.ParseFloat(os.Args[1], 64)
	entityImportRoutingKey = os.Args[3]
	rabbitUser             = os.Args[4]
	rabbitPassword         = os.Args[5]
)

func dialWithRetry(url string) (*amqp.Connection, error) {
	var conn *amqp.Connection
	var err error
	for {
		conn, err = amqp.Dial(url)
		if err == nil {
			break // Connected successfully
		}

		fmt.Printf("Failed to connect to RabbitMQ: %s. Retrying in 5 seconds...\n", err)
		time.Sleep(5 * time.Second) // Wait before retrying
	}
	return conn, nil
}

func initialize() {
	if len(os.Args) < 2 {
		pollingFrequency = 60
	}
	if len(os.Args) < 3 {
		rabbitVHost = "is"
	}
	if len(os.Args) < 4 {
		entityImportRoutingKey = "entity_import_routing_key"
	}
	if len(os.Args) < 5 {
		rabbitUser = "is"
	}
	if len(os.Args) < 6 {
		rabbitPassword = "is"
	}
}

func migrateData() {
	// TODO: Implement your migration logic here
	fmt.Println("Checking updates...")
	// !TODO: 1- Execute a SELECT query to check for any changes on the table
	// !TODO: 2- Execute a SELECT queries with xpath to retrieve the schema we want to store in the relational db
	// !TODO: 3- Execute INSERT queries in the destination db
	// !TODO: 4- Make sure we store somehow in the origin database that certain records were already migrated.
	//          Change the db structure if needed.
	// This might involve interacting with api-entities
}

func handleDelivery(delivery amqp.Delivery) {
    //acknowledge a single delivery (false)
	defer func(delivery amqp.Delivery, multiple bool) {
		err := delivery.Ack(multiple)
		if err != nil {
			log.Println("Error acknowledging message:", err)
		}
	}(delivery, false) // Acknowledge the message after processing

	body := delivery.Body
	fmt.Println("Received message:", string(body))
	fmt.Println("Processing message...")
	migrateData()
	fmt.Printf("Sleeping for %v seconds before processing the next message.\n", pollingFrequency)
	time.Sleep(time.Duration(pollingFrequency) * time.Second)
	fmt.Println("Message processing complete.")
}

func main() {
	initialize()

	signalCh := make(chan os.Signal, 1)
	signal.Notify(signalCh, os.Interrupt, syscall.SIGTERM)

	// Start a goroutine to handle signals. A goroutine is a concurrent thread of execution.
	go func() {
		<-signalCh
		fmt.Println("Received interrupt signal. Stopping the migrator.")
		os.Exit(0)
	}()

    // Connect to XML database
	fmt.Println("Connecting to the XML database...")
	dbXml, err := sql.Open("postgres", "postgres://is:is@db-xml/is")
    if err != nil {
        log.Fatal("Error connecting to the XML database:", err)
    }
    defer func(db *sql.DB) {
     err := db.Close()
     if err != nil {
            log.Println("Error closing connection to the XML database:", err)
     }
    }(dbXml)
    fmt.Println("Connected to the XML database.")
    // Connect to REL database
	fmt.Println("Connecting to the REL database...")
    dbRel, err := sql.Open("postgres", "postgres://is:is@db-rel/is")
    if err != nil {
     log.Fatal("Error connecting to the REL database:", err)
    }
    defer func(db *sql.DB) {
      err := db.Close()
      if err != nil {
          log.Println("Error closing connection to the REL database:", err)
      }
    }(dbRel)
    fmt.Println("Connected to the REL database.")

    // Connect to RabbitMQ
	fmt.Println("Connecting to RabbitMQ...")
	rabbitMQURL := fmt.Sprintf("amqp://%s:%s@rabbitmq:5672/%s", rabbitUser, rabbitPassword, rabbitVHost)
	// Connect to RabbitMQ
	rabbitConn, err := dialWithRetry(rabbitMQURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %s", err)
	}
	defer func(rabbitConn *amqp.Connection) {
		err := rabbitConn.Close()
		if err != nil {
			log.Println("Error closing RabbitMQ connection:", err)
		}
	}(rabbitConn)
	fmt.Println("Connected to RabbitMQ.")
	channel, err := rabbitConn.Channel()
	if err != nil {
		log.Fatal("Error creating RabbitMQ channel:", err)
	}
	defer func(channel *amqp.Channel) {
		err := channel.Close()
		if err != nil {
			log.Println("Error closing RabbitMQ channel:", err)
		}
	}(channel)
	fmt.Println("RabbitMQ channel created successfully.")
	_, err = channel.QueueDeclare(
		entityImportRoutingKey,
		true, // Durable: Whether the queue survives broker restarts
		false, // AutoDelete: Whether the queue is deleted when no consumers are connected
		false, // Exclusive: Whether the queue is exclusive to the connection (only used by this connection)
		false, // NoWait: It will block and wait until the server sends a response confirming the successful creation of the queue
		nil,   // Arguments: Additional optional arguments for queue declaration
	)
	if err != nil {
		log.Fatal("Error declaring RabbitMQ queue:", err)
	}
    fmt.Printf("Declared RabbitMQ queue: %s\n", entityImportRoutingKey)
	messages, err := channel.Consume(
		entityImportRoutingKey,
		"",    // Consumer name (empty means RabbitMQ generates a unique name)
		false, // AutoAck: Whether the server should acknowledge messages automatically
		false, // Exclusive: Whether this consumer should be exclusive to this connection
		false, // NoLocal: Whether the server should not send messages that were published by this connection
		false, // NoWait: Whether to wait for a server response before returning from the method
		nil,   // Arguments
	)
	if err != nil {
		log.Fatal("Error consuming messages from RabbitMQ:", err)
	}
	fmt.Println("Waiting for migration tasks. To exit press CTRL+C")

	for delivery := range messages {
		handleDelivery(delivery)
	}
}
