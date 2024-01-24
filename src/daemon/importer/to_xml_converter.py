from datetime import datetime
import xml.dom.minidom as md
from lxml import etree as ET
from reader import CSVReader
import uuid


def alter_if_empty_value(string, default):
    if string != "":
        return string
    else:
        return default

class CSVtoXMLConverter:

    def __init__(self, csv_path, xsd_path):
        self._reader = CSVReader(csv_path)
        with open(xsd_path, 'r') as xsd:
            self._schema = ET.XMLSchema(ET.parse(xsd))

    def to_xml_str(self):
        xml_str = ET.tostring(self.to_xml(), encoding='utf8', method='xml').decode()
        print("Parsing xml schema...")
        dom = md.parseString(xml_str)
        print("Returning xml schema...")
        return dom.toprettyxml()

    def to_xml(self):
        csv = []
        print("Reading csv file...")
        for row in self._reader.loop():
            csv.append(row)

        print("Creating xml file structure...")
        xml_tree = self.create_element_tree(csv)

        xml_tree = xml_tree.getroot()

        if (self.validate_xml(xml_tree)):
            print("Dataset has been validated")
            return xml_tree
        else:
            print("Dataset has not been validated")

    def validate_xml(self, tree):
        is_valid = self._schema.validate(tree)
        return is_valid

    def create_element_tree(self, csv):
        root = ET.Element('Ufo')
        sightings = ET.SubElement(root, 'Sightings')
        ufo_shapes = ET.SubElement(root, 'Ufo-shapes')
        ufo_shapes_dict = {}
        namespace_uuid = uuid.NAMESPACE_DNS
        for row in csv:
            parsed_ufo_shape = alter_if_empty_value(row.get('UFO_shape'), "Unknown")
            if parsed_ufo_shape not in ufo_shapes_dict:
                ufo_shape_id = str(uuid.uuid5(namespace_uuid, parsed_ufo_shape))
                ufo_shape = ET.SubElement(ufo_shapes, 'Ufo-shape', id=ufo_shape_id)
                ufo_shape.text = parsed_ufo_shape
                ufo_shapes_dict[parsed_ufo_shape] = ufo_shape_id
            else:
                ufo_shape_id = ufo_shapes_dict[parsed_ufo_shape]
            sighting_id = str(uuid.uuid5(namespace_uuid, row.get('')))
            sighting = ET.SubElement(sightings, "Sighting", id=sighting_id, ufo_shape_ref=ufo_shape_id)

            date_time_encounter = ET.SubElement(sighting, "DateTimeEncounter")
            date = ET.SubElement(date_time_encounter, "Date")
            date.text = row.get('Date_time').split()[0]
            time = ET.SubElement(date_time_encounter, "Time")
            time.text = row.get('Date_time').split()[1]
            season = ET.SubElement(date_time_encounter, "Season")
            season.text = row.get('Season')

            date_documented = ET.SubElement(sighting, "DateDocumented")
            date_documented_string = row.get('date_documented')
            parsed_date_document_string = datetime.strptime(date_documented_string, "%m/%d/%Y")
            date_documented.text = parsed_date_document_string.strftime("%Y-%m-%d")

            location = ET.SubElement(sighting, "Location")
            country = ET.SubElement(location, "Country")
            country.text = alter_if_empty_value(row.get('Country'), "N/A")
            region = ET.SubElement(location, "Region")
            region.text = alter_if_empty_value(row.get('Region'), "N/A")
            locale = ET.SubElement(location, "Locale")
            locale.text = alter_if_empty_value(row.get('Locale'), "N/A")

            latitude = ET.SubElement(location, "Latitude")
            latitude.text = alter_if_empty_value(row.get('latitude'), "N/A")
            longitude = ET.SubElement(location, "Longitude")
            longitude.text = alter_if_empty_value(row.get('longitude'), "N/A")

            encounter_duration = ET.SubElement(sighting, "EncounterDuration")
            text = ET.SubElement(encounter_duration, "Text")
            text.text = alter_if_empty_value(row.get('Encounter_Duration'), "N/A")
            seconds_approximate = ET.SubElement(encounter_duration, "SecondsApproximate")
            seconds_approximate.text = str(int(float(row.get('length_of_encounter_seconds'))))

            description = ET.SubElement(sighting, "Description")
            description.text = alter_if_empty_value(row.get('Description'), "N/A")

        return ET.ElementTree(root)


