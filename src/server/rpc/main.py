import sys
from xmlrpc.server import SimpleXMLRPCServer
from xmlrpc.server import SimpleXMLRPCRequestHandler
from db_functions.db_delete import db_available_files_delete, db_delete
from db_functions.db_addfiles import db_available_files_add, db_addfiles
from db_functions.visualize_table import visualize_table
from functions.test_connection import test_connection
from functions.retrieve_year_region import retrieve_year_region
from db_functions.retrieve_xml import retrieve_xml
from db_functions.retrieve_xml_group_by_file import retrieve_xml_group_by_file
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
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("exiting, gracefully", flush=True)
            server.server_close()
            sys.exit(0)
