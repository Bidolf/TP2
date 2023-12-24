import xml.etree.ElementTree as ET
import psycopg2


def split_xml():
    xml_path = "/xml/ufo-sightings.xml"
    tree = ET.parse(xml_path)
    root = tree.getroot()
    sub_xmls = {}
    for sighting in root.findall('.//Sighting'):
        season = sighting.find('./DateTimeEncounter/Season').text
        if season not in sub_xmls:
            sub_xmls[season] = []
        sub_xmls[season].append(sighting)

    for season, sightings in sub_xmls.items():
        sub_root = ET.Element('Sightings')
        sub_tree = ET.ElementTree(sub_root)
        for sighting in sightings:
            sub_root.append(sighting)
        sub_xml_filename = f'/xml/sub_xml/sub_xml_{season}.xml'
        sub_tree.write(sub_xml_filename, xml_declaration=True, encoding='utf-8')


def import_files():
    split_xml()

    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")


        xml_files = [
            {"file_path": "/xml/sub_xml/sub_xml_Autumn.xml", "file_name": "sub_xml_Autumn.xml"},
            {"file_path": "/xml/sub_xml/sub_xml_Spring.xml", "file_name": "sub_xml_Spring.xml"},
            {"file_path": "/xml/sub_xml/sub_xml_Summer.xml", "file_name": "sub_xml_Summer.xml"},
            {"file_path": "/xml/sub_xml/sub_xml_Winter.xml", "file_name": "sub_xml_Winter.xml"}
        ]
        for xml_file_info in xml_files:
            file_name = xml_file_info["file_name"]
            with open(xml_file_info["file_path"], 'r', encoding='utf-8') as file:
                xml_data = file.read()

            cursor = connection.cursor()
            cursor.execute('INSERT INTO imported_documents (file_name, xml, active) VALUES (%s, %s, TRUE)',
                           (file_name, xml_data))
            connection.commit()
            print(f"{file_name} were imported into the table", flush=True)

    except (Exception, psycopg2.Error) as error:
        print("Failed to import files", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1
