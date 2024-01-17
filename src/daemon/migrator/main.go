package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

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

func migrateData(body []byte) error {
	// URL of the API endpoint for sightings
	apiURL := "http://localhost:20001/api/sightings_ufo_shapes"
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("Error sending request to API: %v", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			fmt.Printf("Error closing response body: %v\n", err)
		}
	}(resp.Body)
	// Check the response status
	if resp.StatusCode == http.StatusCreated {
		fmt.Printf("Sighting record created successfully! Status: %d, Message: %s\n", resp.StatusCode, resp.Status)
	} else {
		return fmt.Errorf("Error creating sighting record. Status: %d, Message: %s", resp.StatusCode, resp.Status)
	}
	return nil
}

func handleDelivery(delivery amqp.Delivery, count int) bool {
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
	if err := migrateData(body); err != nil {
		fmt.Println("Error migrating data:", err)
		return false
	}
	fmt.Printf("Sleeping for %v seconds before processing the next message.\n", pollingFrequency)
	time.Sleep(time.Duration(pollingFrequency) * time.Second)
	fmt.Println("Message processing complete.")
	fmt.Printf("Message processing complete. Number of entities migrated: %d\n", count)
	return true
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
		true,  // Durable: Whether the queue survives broker restarts
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
	var count = 0
	var res = true
	for delivery := range messages {
		res = handleDelivery(delivery, count)
		if res {
			count += 1
		}
	}
}
