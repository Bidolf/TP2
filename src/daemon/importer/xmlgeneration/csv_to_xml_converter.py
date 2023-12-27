from datetime import datetime
import xml.dom.minidom as md
from lxml import etree as ET

from .csv_reader import CSVReader


class CSVtoXMLConverter:

    def __init__(self, csv_path, xsd_path):
        self._reader = CSVReader(csv_path)
        with open(xsd_path, 'r') as xsd:
            self._schema = ET.XMLSchema(ET.parse(xsd))

    def to_xml_str(self):
        xml_str = ET.tostring(self.to_xml(), encoding='utf8', method='xml').decode()
        print("Parsing xml schema...")
        dom = md.parseString(xml_str)
        print("Returning xml schema...", flush=True)
        return dom.toprettyxml()


    def to_xml(self):
        csv = []
        print("Reading csv file...", flush=True)
        for row in self._reader.loop():
            csv.append(row)

        print("Creating xml file structure...", flush=True)
        xml_tree = self.create_element_tree(csv)

        xml_tree = xml_tree.getroot()

        if(self.validate_xml(xml_tree)):
            print("Dataset has been validated", flush=True)
            return xml_tree

    def validate_xml(self, tree):
        is_valid = self._schema.validate(tree)
        return is_valid

    def create_element_tree(self, csv):
        root = ET.Element('Sightings')

        for row in csv:
            sighting = ET.SubElement(root, "Sighting", id="_"+row.get(''))

            date_time_encounter = ET.SubElement(sighting, "DateTimeEncounter")
            date = ET.SubElement(date_time_encounter, "Date")
            date.text = row.get('Date_time').split()[0]
            time = ET.SubElement(date_time_encounter, "Time")
            time.text = row.get('Date_time').split()[1]
            season = ET.SubElement(date_time_encounter, "Season")
            season.text = row.get('Season')

            # a schema no ficheiro .csv está no formato "mm/dd/aaaa"
            # mas o datatype Date do xml é no formato "aaaa-mm-dd"
            date_documented = ET.SubElement(sighting, "DateDocumented")
            date_documented_string = row.get('date_documented')
            parsed_date_document_string = datetime.strptime(date_documented_string, "%m/%d/%Y")
            date_documented.text = parsed_date_document_string.strftime("%Y-%m-%d")

            location = ET.SubElement(sighting, "Location")
            country = ET.SubElement(location, "Country")
            country.text = row.get('Country')
            region = ET.SubElement(location, "Region")
            region.text = row.get('Region')
            locale = ET.SubElement(location, "Locale")
            locale.text = row.get('Locale')
            latitude = ET.SubElement(location, "Latitude")
            latitude.text = row.get('latitude')
            longitude = ET.SubElement(location, "Longitude")
            longitude.text = row.get('longitude')

            ufo_shape = ET.SubElement(sighting, "UFOShape")
            ufo_shape.text = row.get('UFO_shape')

            encounter_duration = ET.SubElement(sighting, "EncounterDuration")
            text = ET.SubElement(encounter_duration, "Text")
            text.text = row.get('Encounter_Duration')
            seconds_approximate = ET.SubElement(encounter_duration, "SecondsApproximate")
            seconds_approximate.text = str(int(float(row.get('length_of_encounter_seconds'))))

            description = ET.SubElement(sighting, "Description")
            description.text = row.get('Description')

        return ET.ElementTree(root)