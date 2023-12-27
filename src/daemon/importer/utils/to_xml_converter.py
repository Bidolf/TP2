import math
from datetime import datetime
import xml.dom.minidom as md
from lxml import etree as ET

from utils.reader import CSVReader


class CSVtoXMLConverter:

    def __init__(self, csv_path):
        self._reader = CSVReader(csv_path)

        self._xsd_path = "/schema/ufo-sightings.xsd"

        with open(self._xsd_path, 'r') as xsd:
            self._schema = ET.XMLSchema(ET.parse(xsd))

    def to_xml_parts(self, num_xml_parts):
        csv = []
        csv_parts = [[]]
        xml_parts = []

        print("Reading csv file...", flush=True)
        for row in self._reader.loop():
            csv.append(row)

        # quantas linhas em média é que cada ficheiro deve ter
        rows_per_part = math.ceil(len(csv)/num_xml_parts)

        print(f"rows per part: {rows_per_part}  -  total rows: {len(csv)}", flush=True)

        # adicionar as linhas a cada parte
        part_index = 0
        for i, row in enumerate(csv):
            csv_parts[part_index].append(row)
            # se já tem linhas suficientes,
            # começa a adicionar linhas à próxima parte
            if (((i+1) % rows_per_part) < 1):
                print(f"row {i}  -  part_index {part_index}", flush=True)
                part_index += 1
                csv_parts.append([])

        # gerar xml para cada parte
        print("Creating xml file structures...", flush=True)
        for part in csv_parts:
            xml_tree = self.create_element_tree(part)

            xml_tree = xml_tree.getroot()

            if (self.validate_xml(xml_tree)):
                xml_parts.append(xml_tree)

        return xml_parts

    def to_xml_parts_str(self, num_xml_parts):
        xml_parts = self.to_xml_parts(num_xml_parts)
        xml_parts_str = []

        # converter o xml em cada parte para string
        print("Parsing xml schema of each part...", flush=True)
        for part in xml_parts:
            xml_str = ET.tostring(part, encoding='utf8', method='xml').decode()

            dom = md.parseString(xml_str)
            xml_parts_str.append(dom.toprettyxml())

        return xml_parts_str


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