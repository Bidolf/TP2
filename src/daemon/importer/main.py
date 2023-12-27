import os, sys
import asyncio
import time
import uuid

import psycopg2

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from utils.to_xml_converter import CSVtoXMLConverter

NUM_XML_PARTS = int(sys.argv[1]) if len(sys.argv) >= 2 else 1


def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']


def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"


def convert_csv_to_xml(in_path, file_name, num_xml_parts):
    """
    :param in_path: Path of CSV file
    :param directory: Directory of where to put the resulting XML files
    :param num_xml_parts: How many XML files will be generated
    :return: A tuple of (file_path, xml_content)
    """
    converter = CSVtoXMLConverter(in_path)
    xml_files = []
    xml_parts_str = converter.to_xml_parts_str(num_xml_parts)

    for i, part in enumerate(xml_parts_str):
        file_path = f"{file_name}_{i}.xml"
        file = open(file_path, "w")
        file.write(part)

        xml_files.append((file_path, part))

    return xml_files
    # file = open(out_path, "w")
    # xml_content = converter.to_xml_str()
    # file.write(xml_content)
    # return xml_content


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

        # filename includes the directory where the xml files will be generated
        xml_file_directory_name = f"{self._output_path}/{str(uuid.uuid4())}"

        # we do the conversion
        # xml_files is an array of tuples of (file_path, xml_content)
        # first element of each tuple is the file's name with the part's number and the .xml suffix
        # second element is the file's content
        xml_files = convert_csv_to_xml(csv_path, xml_file_directory_name, NUM_XML_PARTS)
        print(f"new xml files have been generated", flush=True)

        # store converted document to public.converted_documents in pg-xml
        await self.add_new_converted_document(csv_path, csv_file_size, xml_file_directory_name)
        # import xml files to public.imported_documents in pg-xml
        for xml_path, xml_content in xml_files:
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
            print("Failed to fetch schema", error, flush=True)

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
            print(f"{xml_path} was inserted in the converted_documents table", flush=True)

        except (Exception, psycopg2.Error) as error:
            print(f"Failed to insert {xml_path} in the converted_documents table", error, flush=True)

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
