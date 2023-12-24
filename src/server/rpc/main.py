import signal, sys
from xmlrpc.server import SimpleXMLRPCServer
from xmlrpc.server import SimpleXMLRPCRequestHandler
from xmlgeneration.xmlgeneration import xmlgeneration
from db_functions.db_delete import db_available_files_delete, db_delete
from db_functions.db_addfiles import db_available_files_add, db_addfiles
from db_functions.db_exists import db_exists
from db_functions.import_files import import_files
from src.server.rpc.db_functions.visualize_table import visualize_table
from functions.test_connection import test_connection
from functions.retrieve_year_region import retrieve_year_region
from src.server.rpc.db_functions.retrieve_xml import retrieve_xml
from src.server.rpc.db_functions.retrieve_xml_group_by_file import retrieve_xml_group_by_file
from functions.retrieve_shape_region import retrieve_shape_region
from functions.get_number_sightings_in_year import get_number_sightings_in_year
from functions.get_number_sightings_group_by_year import get_number_sightings_group_by_year
from functions.retrieve_shape_month import retrieve_shape_month

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000

if __name__ == "__main__":
    class RequestHandler(SimpleXMLRPCRequestHandler):
        rpc_paths = ('/RPC2',)

    with SimpleXMLRPCServer(('localhost', PORT), requestHandler=RequestHandler) as server:
        server.register_introspection_functions()

        def signal_handler(signum, frame):
            print("received signal", flush=True)
            server.server_close()

            # perform clean up, etc. here...
            print("exiting, gracefully", flush=True)
            sys.exit(0)

        # signals
        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGHUP, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

        # register functions here
        server.register_function(test_connection)
        server.register_function(db_delete)
        server.register_function(db_addfiles)
        server.register_function(visualize_table)
        server.register_function(db_available_files_delete)
        server.register_function(db_available_files_add)
        server.register_function(retrieve_year_region)
        server.register_function(retrieve_xml)
        server.register_function(retrieve_shape_region)
        server.register_function(retrieve_xml_group_by_file)
        server.register_function(retrieve_shape_month)
        server.register_function(get_number_sightings_in_year)
        server.register_function(get_number_sightings_group_by_year)

        # start the server
        print(f"Starting the RPC Server in port {PORT}...", flush=True)
        if not db_exists():
            xmlgeneration()
            import_files()
            print("Server is ready", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("exiting, gracefully", flush=True)
            server.server_close()
            sys.exit(0)