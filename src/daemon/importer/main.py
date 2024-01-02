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
import xml.etree.ElementTree as ET
import xml.dom.minidom as md
from lxml import etree as ET


def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']


def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"


def convert_csv_to_xml(in_path, out_path, num_xml_parts, xsd_path):
    try:
        converter = CSVtoXMLConverter(in_path, xsd_path)
        xml_str = converter.to_xml_str()

        root = ET.fromstring(xml_str)

        total_elements = len(list(root))
        print(total_elements)
        elements_per_part = total_elements // num_xml_parts
        list_xml_path = []

        for i in range(num_xml_parts):
            new_root = ET.Element(root.tag)
            for element in list(root)[i * elements_per_part: (i + 1) * elements_per_part]:
                new_root.append(element)

            new_tree = ET.ElementTree(new_root)
            xml_str = ET.tostring(new_tree, encoding='utf-8', method='xml').decode()
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
    # Start the daemon
    #with daemon.DaemonContext(
    #        pidfile=lockfile.FileLock('/var/run/csv_to_xml_daemon.pid'),
    #        stderr=open('/tmp/csv_to_xml_err.log', 'w+'),
    #        stdout=open('/tmp/csv_to_xml_out.log', 'w+')):
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        observer.join()

