package main

import (
    "database/sql"
	"fmt"
	"os"
	"io/ioutil"
	"log"
	"time"
	"strings"

    amqp "github.com/rabbitmq/amqp091-go"
	_ "github.com/lib/pq"
)


func sayHelloWorld() {
	fmt.Println("Hello, World!!")
}

func listXMLFiles() {
	files, err := ioutil.ReadDir("/xml")
	if err != nil {
		fmt.Printf("Error accessing /xml: %s\n", err)
		return
	}

	for _, f := range files {
		if strings.HasSuffix(f.Name(), ".xml") {
			fmt.Printf("\t> %s\n", f.Name())
		}
	}
}

func main() {
    fmt.Printf("args: %d\n", len(os.Args[1:]))
    fmt.Printf("%s\n", os.Args[1:])
    dbConnectionString := "postgres://is:is@db-xml:5432/is?sslmode=disable"
    rabbitUser := os.Args[1]
    rabbitPassword := os.Args[2]
    rabbitVHost := os.Args[3]
    rabbitMQURL := fmt.Sprintf("amqp://%s:%s@rabbitmq:5672/%s", rabbitUser, rabbitPassword, rabbitVHost)
    queueName := "new_entries_queue"
    // args for this main are $RABBITMQ_DEFAULT_USER, $RABBITMQ_DEFAULT_PASS, $RABBITMQ_DEFAULT_VHOST, and $POLLING_FREQ

    fmt.Println(dbConnectionString)
    fmt.Println(rabbitMQURL)

	// Connect to RabbitMQ
	rabbitConn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %s", err)
	}
	defer rabbitConn.Close()

    fmt.Println("dialed")

	ch, err := rabbitConn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %s", err)
	}
	defer ch.Close()

    fmt.Println("channel connected")

	// Declare a queue for messages
	_, err = ch.QueueDeclare(
		queueName, // Queue name
		true,      // Durable
		false,     // Delete when unused
		false,     // Exclusive
		false,     // No-wait
		nil,       // Arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %s", err)
	}

    fmt.Println("queue declared")

	// Connect to PostgreSQL database
	db, err := sql.Open("postgres", dbConnectionString)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %s", err)
	}
	defer db.Close()

	// Regularly check the database for new entries
	ticker := time.NewTicker(60 * time.Second) // Example: check every 60 seconds
	defer ticker.Stop()
    lastCheckedTime := time.Now().Format(time.DateTime)

	for range ticker.C {
		// Query for new entries (customize this query based on your schema)
		rows, err := db.Query("SELECT id, file_name, xml, active FROM imported_documents WHERE created_on > $1", lastCheckedTime)
		if err != nil {
			log.Printf("Error querying database: %s", err)
			continue
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var message string
			if err := rows.Scan(&id, &message); err != nil {
				log.Printf("Error scanning row: %s", err)
				continue
			}

			// Publish message to RabbitMQ
// 			err = ch.Publish(
// 				"",        // Exchange
// 				queueName, // Routing key
// 				false,     // Mandatory
// 				false,     // Immediate
// 				amqp.Publishing{
// 					ContentType: "text/plain",
// 					Body:        []byte(fmt.Sprintf("New entry with ID: %d, Message: %s", id, message)),
// 				})
// 			if err != nil {
// 				log.Printf("Failed to publish message: %s", err)
// 				continue
// 			}
            fmt.Println("test-  message was going to be sent")


			// Update the last checked time to avoid reprocessing old entries
		}

	    lastCheckedTime = time.Now().Format(time.DateTime)
	}
}
