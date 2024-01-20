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

type DateTimeEncounterType struct {
	Data   string `xml:"Date"`
	Tempo   string `xml:"Time"`
	Season string `xml:"Season"`
}

type DateDocumentedType struct {
	Data string `xml:",innerxml"`
}

type EncounterDurationType struct {
	Texto              string `xml:"Text"`
	SecondsApproximate int    `xml:"SecondsApproximate"`
}

type LocationXMLType struct {
	Country    string `xml:"Country"`
	Region     string `xml:"Region"`
	Locality     string `xml:"Locale"`
	Latitude   string `xml:"Latitude"`
	Longitude  string `xml:"Longitude"`
}

type SightingXML struct {
	ID                string                `xml:"id,attr"`
	UfoShapeRef       string                `xml:"ufo_shape_ref,attr"`
	DateTimeEncounter DateTimeEncounterType `xml:"DateTimeEncounter"`
	DateDocumented    DateDocumentedType    `xml:"DateDocumented"`
	Location          LocationXMLType       `xml:"Location"`
	EncounterDuration EncounterDurationType `xml:"EncounterDuration"`
	Description       string                `xml:"Description"`
}

type LocationType struct {
	Country             string
	Region              string
	Locality            string
	LocationGeometry    *string
}

type Sighting struct {
	ID                string
	UfoShapeRef       string
	DateTimeEncounter DateTimeEncounterType
	DateDocumented    DateDocumentedType
	Location          LocationType
	EncounterDuration EncounterDurationType
	Description       string
}

type UfoShape struct {
    ID string `xml:"id,attr"`
	Value string `xml:",chardata"`
}

type UfoShapes struct {
    UfoShapes []UfoShape `xml:"Ufo-shape"`
}

type UfoData struct {
	Sightings  []SightingXML `xml:"Sightings>Sighting"`
	UfoShapes  UfoShapes  `xml:"Ufo-shapes"`
}

type Entity struct {
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
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

func sendEntityToRabbitMQ(ch *amqp.Channel, routingKey string, entityType string, entityContent interface{}) error {

	 entity := Entity{
		Type: entityType,
		Content: entityContent,
	}

	entityJSON, err := json.Marshal(entity)
	if err != nil {
		return err
	}

	fmt.Println(string(entityJSON))

	// Publish message to RabbitMQ
	err = ch.Publish("", routingKey, false, false, amqp.Publishing{
		ContentType: "application/json", // Change content type as needed
		Body:        entityJSON,
	})
	if err != nil {
		return err
	}

	fmt.Println("Sent message of ",entityType,"to ",routingKey)

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
    entityImportRoutingKey := os.Args[4]
    geoDataUpdateRoutingKey := os.Args[5]
    floatArg6, err := strconv.ParseFloat(os.Args[6], 64)
	if err != nil {
		log.Fatalln("Error:", err)
		return
	}
	pollingFrequency := floatArg6
    // args for this main are $RABBITMQ_DEFAULT_USER, $RABBITMQ_DEFAULT_PASS, $RABBITMQ_DEFAULT_VHOST,
    // $ROUTING_KEY_ENTITY_IMPORT, $ROUTING_KEY_GEO_DATA_UPDATE, and $POLLING_FREQ
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
	declareQueue(ch, entityImportRoutingKey)
    fmt.Println("\"entity import\" queue declared")

	declareQueue(ch, geoDataUpdateRoutingKey)
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


    sightingCounter := 0
    shapeCounter := 0
    fileCounter := 0
	for range ticker.C {
        fmt.Println("ticker is ticking")
		// Query for new entries
		importDocumentsQuery := "SELECT id, file_name, xml, active, scanned, created_on FROM imported_documents"
		rows, err := db.Query(importDocumentsQuery)
		if err != nil {
			fmt.Printf("Error querying database: %s\n", err)
			continue
		}
		defer rows.Close()

        fmt.Println("last checked time: ", lastCheckedTime)
        sightingCounter = 0
        shapeCounter = 0
        fileCounter = 0
		for rows.Next() {
			var id int
			var fileName string
			var xmlData string
			var isActive bool
			var wasScanned bool
			var createdOn time.Time
			if err := rows.Scan(&id, &fileName, &xmlData, &isActive, &wasScanned, &createdOn); err != nil {
				fmt.Printf("Error scanning row: %s\n", err)
				continue
			}

            // Check if this entry should be analized
            if(isActive){
                if(!wasScanned){
                    if(createdOn.After(lastCheckedTime)){
                        fmt.Printf("file name: %s, Created On: %s\n", fileName, createdOn)
                        var ufoData UfoData

                        // Unmarshal XML data into struct
                        err := xml.Unmarshal([]byte(xmlData), &ufoData)
                        if err != nil {
                            log.Fatal(err)
                        }

                        // Extract every Sighting from Sightings
                        for _, sightingXML := range ufoData.Sightings {

                            latitude := sightingXML.Location.Latitude
                            longitude := sightingXML.Location.Longitude

                            var locationGeoData *string
                            var pointString = ""

                            if (latitude != "" && longitude != ""){
                                pointString = "POINT("+longitude+" "+latitude+")"
                                locationGeoData = &pointString
                            }

                            sightingGeoData := Sighting{
                                ID: sightingXML.ID,
                                UfoShapeRef: sightingXML.UfoShapeRef,
                                DateTimeEncounter: sightingXML.DateTimeEncounter,
                                DateDocumented: sightingXML.DateDocumented,
                                Location: LocationType{
                                    Country: sightingXML.Location.Country,
                                    Region: sightingXML.Location.Region,
                                    Locality: sightingXML.Location.Locality,
                                    LocationGeometry: locationGeoData,
                                },
                                EncounterDuration: sightingXML.EncounterDuration,
                                Description: sightingXML.Description,
                            }

                            err := sendEntityToRabbitMQ(ch, entityImportRoutingKey, "sighting", sightingGeoData)
                            if err != nil {
                                log.Println(err)
                                continue
                            }

                            if(locationGeoData == nil){
                                err := sendEntityToRabbitMQ(ch, geoDataUpdateRoutingKey, "sighting", sightingGeoData)
                                if err != nil {
                                    log.Println(err)
                                    continue
                                }
                            }

                            sightingCounter += 1
                        }

                        // Extract every Ufo-shape from Ufo-shapes
                        for _, ufoShape := range ufoData.UfoShapes.UfoShapes {
                            err := sendEntityToRabbitMQ(ch, entityImportRoutingKey, "ufo_shape", ufoShape)
                            if err != nil {
                                log.Println(err)
                                continue
                            }
                            shapeCounter += 1
                        }

                        updateScannedQuery := "UPDATE imported_documents SET scanned=true WHERE id=$1"
                        _, err = db.Exec(updateScannedQuery, id)
                        if err != nil {
                            log.Printf("Error: Could not update variable \"scanned\" on line with id \"%d\"", id)
                            continue;
                        }

                        fileCounter += 1

                    }
                }
            }
		}
		fmt.Println("Files: ",fileCounter,", sightings: ",sightingCounter,", shapes: ",shapeCounter)
		// Update the last checked time to avoid reprocessing old entries
	    lastCheckedTime = time.Now()
	}
}
