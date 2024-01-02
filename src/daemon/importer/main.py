import asyncio
import sys
import time
import uuid
import os
from datetime import datetime
import daemon
import lockfile
import psycopg2
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent
from to_xml_converter import CSVtoXMLConverter
import xml.dom.minidom as md
from lxml import etree as ET


def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']


def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"


def count_elements_by_tag(element, tag_name):
    count = 0
    for child in element.iter(tag=tag_name):
        count += 1
    return count


def copy_element(element, parent):
    new_element = ET.SubElement(parent, element.tag)
    for child in element:
        copy_element(child, new_element)
    return new_element


def slice_tree(original_root, elements_per_part):
    new_root = ET.Element(original_root.tag)
    a = 0
    sightings = original_root.find("Sightings")
    new_sightings = ET.Element("Sightings")
    for i, child in enumerate(sightings):
        if i < elements_per_part:
            copy_element(child, new_sightings)
            sightings.remove(child)
            a = i

    if len(new_sightings) > 0:
        new_root.append(new_sightings)

    if a == 0:
        ufo_shapes = original_root.find("Ufo-shapes")
        new_ufo_shapes = ET.Element("Ufo-shapes")
        for i, child in enumerate(ufo_shapes):
            if i < elements_per_part:
                copy_element(child, new_ufo_shapes)
                ufo_shapes.remove(child)

        if len(new_ufo_shapes) > 0:
            new_root.append(new_ufo_shapes)

    return new_root


def convert_csv_to_xml(in_path, out_path, num_xml_parts, xsd_path):
    try:
        converter = CSVtoXMLConverter(in_path, xsd_path)
        xml_str = converter.to_xml_str()

        root = ET.fromstring(xml_str)

        sighting_count = count_elements_by_tag(root, 'Sighting')
        print(f"Total Sightings: {sighting_count}", flush=True)
        ufo_shape_count = count_elements_by_tag(root, 'Ufo-shape')
        print(f"Total Ufo-shapes: {ufo_shape_count}", flush=True)
        total_elements = sighting_count + ufo_shape_count
        print(f"Total Elements: {total_elements}", flush=True)
        elements_per_part = total_elements // num_xml_parts
        missing_elements = total_elements - (elements_per_part * num_xml_parts)
        print(f"Elements per part: {elements_per_part}", flush=True)
        print(f"Missing elements: {missing_elements}", flush=True)

        list_xml_path = []
        i = 0
        while i < num_xml_parts:
            if i == num_xml_parts - 1:
                new_root = root
            else:
                new_root = slice_tree(root, elements_per_part)

            new_tree = ET.ElementTree(new_root)
            xml_str = ET.tostring(new_tree.getroot(), encoding='utf-8', method='xml').decode()
            dom = md.parseString(xml_str)
            xml_file = dom.toprettyxml()

            # Generate a unique file name for the XML file
            xml_path = generate_unique_file_name(out_path)
            print(f"Writing XML part: {xml_path}...", flush=True)

            with open(xml_path, "w", encoding='utf-8') as f:
                f.write(xml_file)

            print(f"XML part has been written", flush=True)
            list_xml_path.append(xml_path)

        return list_xml_path

    except Exception as e:
        print(f"Error during XML conversion: {e}")
        raise


def update_converted_documents_table(csv_path, list_xml_path):
    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        for xml_path in list_xml_path:
            cursor.execute("""
                            INSERT INTO "converted_documents" (src, dst, file_size, active, created_on, updated_on)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                csv_path, xml_path, os.path.getsize(xml_path), True, datetime.now(), datetime.now()))
            connection.commit()
    except (Exception, psycopg2.Error) as error:
        print("Failed to update converted_documents table", error, flush=True)
    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1


def storeXML_imported_documents_table(list_xml_path):
    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        for xml_path in list_xml_path:
            with open(xml_path, 'r', encoding='utf-8') as xml_file:
                xml_content = xml_file.read()
            cursor.execute("""
                            INSERT INTO "imported_documents" (file_name, xml, active, created_on, updated_on, deleted_on)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (xml_path, xml_content, True, datetime.now(), datetime.now(), datetime.now()))
            connection.commit()
    except (Exception, psycopg2.Error) as error:
        print("Failed to import the XML parts into the imported_documents table", error, flush=True)
    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1


class CSVHandler(FileSystemEventHandler):
    def __init__(self, input_path, output_path, num_xml_parts, xsd_path):
        self._output_path = output_path
        self._input_path = input_path
        self._num_xml_parts = num_xml_parts
        self._xsd_path = xsd_path

        # generate file creation events for existing files
        for file in [os.path.join(dp, f) for dp, dn, filenames in os.walk(input_path) for f in filenames]:
            event = FileCreatedEvent(os.path.join(CSV_INPUT_PATH, file))
            event.event_type = "created"
            self.dispatch(event)

    async def convert_csv(self, csv_path):
        # here we avoid converting the same file again
        # !TODO: check converted files in the database
        if csv_path in await self.get_converted_files():
            return

        print(f"new file to convert: '{csv_path}'", flush=True)

        # we do the conversion
        # !TODO: once the conversion is done, we should updated the converted_documents tables
        list_xml_path = convert_csv_to_xml(csv_path, self._output_path, self._num_xml_parts, self._xsd_path)
        print("All XML parts have been written", flush=True)
        update_converted_documents_table(csv_path, list_xml_path)
        print("The converted_documents table has been updated", flush=True)
        # !TODO: we should store the XML document into the imported_documents table
        storeXML_imported_documents_table(list_xml_path)
        print("All XML parts have been imported into the imported_documents table", flush=True)

    async def get_converted_files(self):
        # !TODO: you should retrieve from the database the files that were already converted before
        connection = None
        cursor = None
        files = []
        try:
            connection = psycopg2.connect(user="is",
                                          password="is",
                                          host="db-xml",
                                          port="5432",
                                          database="is")

            cursor = connection.cursor()
            cursor.execute('SELECT src FROM "converted_documents" WHERE active = TRUE')
            file_names = cursor.fetchall()
            for file_name in file_names:
                files.append(file_name[0])
        except (Exception, psycopg2.Error) as error:
            print("Failed to retrieve converted files", error, flush=True)
        finally:
            if connection:
                cursor.close()
                connection.close()
        return files

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".csv"):
            asyncio.run(self.convert_csv(event.src_path))


if __name__ == "__main__":
    CSV_INPUT_PATH = "/csv"
    XML_OUTPUT_PATH = "/xml"
    XSD_PATH = "/xml/ufo_sightings.xsd"
    if len(sys.argv) >= 2:
        NUM_XML_PARTS = int(sys.argv[1])
    else:
        NUM_XML_PARTS = 1
    observer = Observer()
    observer.schedule(
        CSVHandler(CSV_INPUT_PATH, XML_OUTPUT_PATH, NUM_XML_PARTS, XSD_PATH),
        path=CSV_INPUT_PATH,
        recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        observer.join()
