package main

import (
    "database/sql"
	"fmt"
	"os"
	"io/ioutil"
	"log"
	"time"
	"strings"
	"strconv"

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

func main() {
    fmt.Printf("args: %d\n", len(os.Args[1:]))
    fmt.Printf("%s\n", os.Args[1:])
    rabbitUser := os.Args[1]
    rabbitPassword := os.Args[2]
    rabbitVHost := os.Args[3]
    queueName := os.Args[4]
    floatArg5, err := strconv.ParseFloat(os.Args[5], 64)
	if err != nil {
		log.Fatalln("Error:", err)
		return
	}
	pollingFrequency := floatArg5
    // args for this main are $RABBITMQ_DEFAULT_USER, $RABBITMQ_DEFAULT_PASS, $RABBITMQ_DEFAULT_VHOST, $RABBITMQ_QUEUE_NAME, and $POLLING_FREQ
    dbConnectionString := "postgres://is:is@db-xml:5432/is?sslmode=disable"
    rabbitMQURL := fmt.Sprintf("amqp://%s:%s@rabbitmq:5672/%s", rabbitUser, rabbitPassword, rabbitVHost)

    fmt.Println(dbConnectionString)
    fmt.Println(rabbitMQURL)

	// Connect to RabbitMQ
	rabbitConn, err := dialWithRetry(rabbitMQURL)
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
    fmt.Println(dbConnectionString)
    fmt.Println("connected to postgres")

	// Regularly check the database for new entries
	ticker := time.NewTicker(time.Duration(pollingFrequency) * time.Second)
	defer ticker.Stop()

	// Start time is zero
    var lastCheckedTime time.Time

	for range ticker.C {
        fmt.Println("ticker is ticking")
		// Query for new entries
		rows, err := db.Query("SELECT id, file_name, xml, active, created_on FROM imported_documents")
		if err != nil {
			fmt.Printf("Error querying database: %s\n", err)
			continue
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var fileName string
			var xmlData string
			var isActive bool
			var createdOn time.Time
			if err := rows.Scan(&id, &fileName, &xmlData, &isActive, &createdOn); err != nil {
				fmt.Printf("Error scanning row: %s\n", err)
				continue
			}

            // Check if this entry should be analized
            if(isActive){
                if(createdOn.After(lastCheckedTime)){
                    fmt.Printf("ID: %d, Created On: %s\n", id, createdOn)
                    fmt.Println(lastCheckedTime)
                }
            }

			// Publish message to RabbitMQ
			err = ch.Publish(
				"",        // Exchange
				queueName, // Routing key
				false,     // Mandatory
				false,     // Immediate
				amqp.Publishing{
					ContentType: "text/plain",
					Body:        []byte(fmt.Sprintf("New entry with ID: %d, Message: %s", id, message)),
				})
			if err != nil {
				fmt.Printf("Failed to publish message: %s", err)
				continue
			}


		}
		// Update the last checked time to avoid reprocessing old entries
	    lastCheckedTime = time.Now()

	}
}
