import asyncio
import time
import uuid

import psycopg2

import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from utils.to_xml_converter import CSVtoXMLConverter

def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']

def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"

def convert_csv_to_xml(in_path, out_path):
    converter = CSVtoXMLConverter(in_path)
    file = open(out_path, "w")
    xml_content = converter.to_xml_str()
    file.write(xml_content)
    return xml_content

class CSVHandler(FileSystemEventHandler):
    def __init__(self, input_path, output_path):
        self._output_path = output_path
        self._input_path = input_path

        # generate file creation events for existing files
        for file in [os.path.join(dp, f) for dp, dn, filenames in os.walk(input_path) for f in filenames]:
            event = FileCreatedEvent(os.path.join(CSV_INPUT_PATH, file))
            event.event_type = "created"
            self.dispatch(event)

    async def convert_csv(self, csv_path):
        # here we avoid converting the same file again
        if csv_path in await self.get_converted_files():
            return

        print(f"new file to convert: '{csv_path}'", flush=True)
        csv_file_size = os.path.getsize(csv_path)
        print(f"csv file size: '{csv_path}'", flush=True)

        # we generate a unique file name for the XML file
        xml_path = generate_unique_file_name(self._output_path)

        # we do the conversion
        xml_content = convert_csv_to_xml(csv_path, xml_path)
        print(f"new xml file generated: '{xml_path}'", flush=True)

        await self.add_new_converted_document(csv_path, csv_file_size, xml_path)

        await self.import_xml_document(xml_path, xml_content)

    async def get_converted_files(self):
        connection = None
        cursor = None

        converted_documents = []

        try:
            connection = psycopg2.connect(user="is",
                                          password="is",
                                          host="db-xml",
                                          port="5432",
                                          database="is")

            cursor = connection.cursor()
            cursor.execute("SELECT src FROM converted_documents")

            for document in cursor:
                converted_documents.append(document)

        except (Exception, psycopg2.Error) as error:
            print("Failed to fetch data", error, flush=True)

        finally:
            if connection:
                cursor.close()
                connection.close()

        return converted_documents

    async def add_new_converted_document(self, csv_path, csv_file_size, xml_path):
        connection = None
        cursor = None

        try:
            connection = psycopg2.connect(user="is",
                                          password="is",
                                          host="db-xml",
                                          port="5432",
                                          database="is")

            cursor = connection.cursor()
            cursor.execute("INSERT INTO converted_documents(src, file_size, dst) VALUES (%s, %s, %s)",
                           (csv_path, csv_file_size, xml_path))
            print(f"{csv_path} was inserted in the converted_documents table", flush=True)

        except (Exception, psycopg2.Error) as error:
            print(f"Failed to insert {csv_path} in the converted_documents table", error, flush=True)

        finally:
            if connection:
                cursor.close()
                connection.close()

    async def import_xml_document(self, xml_path, xml_content):
        connection = None
        cursor = None

        try:
            connection = psycopg2.connect(user="is",
                                          password="is",
                                          host="db-xml",
                                          port="5432",
                                          database="is")

            cursor = connection.cursor()
            cursor.execute("INSERT INTO imported_documents (file_name, xml, active) VALUES (%s, %s,TRUE)",
                           (xml_path, xml_content))
            connection.commit()
            print(f"{xml_path} was inserted in the imported_documents table", flush=True)

        except (Exception, psycopg2.Error) as error:
            print(f"Failed to insert {xml_path} in the imported_documents table", error)

        finally:
            if connection:
                cursor.close()
                connection.close()


    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".csv"):
            asyncio.run(self.convert_csv(event.src_path))


if __name__ == "__main__":

    CSV_INPUT_PATH = "/csv"
    XML_OUTPUT_PATH = "/xml"

    # create the file observer
    observer = Observer()
    observer.schedule(
        CSVHandler(CSV_INPUT_PATH, XML_OUTPUT_PATH),
        path=CSV_INPUT_PATH,
        recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        observer.join()
