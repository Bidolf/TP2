package main

import (
    "database/sql"
	"encoding/json"
	"encoding/xml"
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

type DateTimeEncounterType struct {
	Date   string `xml:"Date"`
	Time   string `xml:"Time"`
	Season string `xml:"Season"`
}

type DateDocumentedType struct {
	Date string `xml:",innerxml"`
}

type LocationType struct {
	Country    string `xml:"Country"`
	Region     string `xml:"Region"`
	Locale     string `xml:"Locale"`
	Latitude   string `xml:"Latitude"`
	Longitude  string `xml:"Longitude"`
}

type EncounterDurationType struct {
	Text              string `xml:"Text"`
	SecondsApproximate int    `xml:"SecondsApproximate"`
}

type Sighting struct {
	ID                string                `xml:"id,attr"`
	UfoShapeRef       string                `xml:"ufo_shape_ref,attr"`
	DateTimeEncounter DateTimeEncounterType `xml:"DateTimeEncounter"`
	DateDocumented    DateDocumentedType    `xml:"DateDocumented"`
	Location          LocationType          `xml:"Location"`
	EncounterDuration EncounterDurationType `xml:"EncounterDuration"`
	Description       string                `xml:"Description"`
}

type UfoShape struct {
    ID string `xml:"id,attr"`
}

type UfoShapes struct {
    UfoShapes []UfoShape `xml:"Ufo-shape"`
}

type UfoData struct {
	Sightings  []Sighting `xml:"Sightings>Sighting"`
	UfoShapes  UfoShapes  `xml:"Ufo-shapes"`
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

func sendSightingToRabbitMQ(ch *amqp.Channel, sighting Sighting) error {
	// Convert sighting to JSON or any preferred format
	sightingJSON, err := json.Marshal(sighting)
	if err != nil {
		return err
	}

	// Publish message to RabbitMQ with a specific routing key for sightings
	err = ch.Publish("", "sighting_routing_key", false, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        sightingJSON,
	})
	if err != nil {
		return err
	}

	return nil
}

func sendUfoShapeToRabbitMQ(ch *amqp.Channel, ufoShape UfoShape) error {
	// Convert ufoShape to JSON or any preferred format
	ufoShapeJSON, err := json.Marshal(ufoShape)
	if err != nil {
		return err
	}

	// Publish message to RabbitMQ with a specific routing key for Ufo-shapes
	err = ch.Publish("", "ufo_shape_routing_key", false, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        ufoShapeJSON,
	})
	if err != nil {
		return err
	}

	return nil
}

func declareQueue(ch *amqp.Channel, queueName string){
    _, err := ch.QueueDeclare(
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
}

func main() {
    fmt.Printf("args: %d\n", len(os.Args[1:]))
    fmt.Printf("%s\n", os.Args[1:])
    rabbitUser := os.Args[1]
    rabbitPassword := os.Args[2]
    rabbitVHost := os.Args[3]
    floatArg4, err := strconv.ParseFloat(os.Args[4], 64)
	if err != nil {
		log.Fatalln("Error:", err)
		return
	}
	pollingFrequency := floatArg4
    // args for this main are $RABBITMQ_DEFAULT_USER, $RABBITMQ_DEFAULT_PASS, $RABBITMQ_DEFAULT_VHOST, and $POLLING_FREQ
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

    // Open a channel
	ch, err := rabbitConn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %s", err)
	}
	defer ch.Close()
    fmt.Println("channel connected")

	// Declare a queue for messages
	declareQueue(ch, "sighting_routing_key")
    fmt.Println("\"sighting\" queue declared")

	declareQueue(ch, "ufo_shape_routing_key")
    fmt.Println("\"ufo shape\" queue declared")

	declareQueue(ch, "sighting_geo_data_routing_key")
    fmt.Println("\"update geo data on sighting\" queue declared")


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

        fmt.Println("last checked time: ", lastCheckedTime)
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
                    fmt.Printf("file name: %s, Created On: %s\n", fileName, createdOn)
                    var ufoData UfoData

                    // Unmarshal XML data into struct
                    err := xml.Unmarshal([]byte(xmlData), &ufoData)
                    if err != nil {
                        log.Fatal(err)
                    }

                    // Extract every Sighting from Sightings
                    for _, sighting := range ufoData.Sightings {
                        err := sendSightingToRabbitMQ(ch, sighting)
                        if err != nil {
                            log.Println(err)
                            continue
                        }
                        fmt.Printf("Sighting ID: %s\n", sighting.ID)
                    }

                    // Extract every Ufo-shape from Ufo-shapes
                    for _, ufoShape := range ufoData.UfoShapes.UfoShapes {
                        err := sendUfoShapeToRabbitMQ(ch, ufoShape)
                        if err != nil {
                            log.Println(err)
                            continue
                        }
                        fmt.Printf("Ufo Shape ID: %s\n", ufoShape.ID)
                    }

                }
            }
		}
		// Update the last checked time to avoid reprocessing old entries
	    lastCheckedTime = time.Now()

	}
}
