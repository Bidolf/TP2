import sys
import xmlrpc.client

from flask import Flask, jsonify

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000
RPC_SERVER_URL = 'http://rpc-server:9000'

app = Flask(__name__)
app.config["DEBUG"] = True

# server.register_function(db_delete)
# server.register_function(db_addfiles)
# server.register_function(visualize_table)
# server.register_function(db_available_files_delete)
# server.register_function(retrieve_year_region)
# server.register_function(retrieve_xml)
# server.register_function(retrieve_shape_region)
# server.register_function(retrieve_xml_group_by_file)
# server.register_function(retrieve_shape_month)
# server.register_function(get_number_sightings_in_year)
# server.register_function(get_number_sightings_group_by_year)

def call_rpc_method(method_name, *args):
    try:
        with xmlrpc.client.ServerProxy(RPC_SERVER_URL) as proxy:
            method = getattr(proxy, method_name)
            result = method(*args)
            return result
    except Exception as e:
        return e

@app.route('/api/db/available_files_add', methods=['GET'])
def db_available_files_add():
    try:
        result = call_rpc_method('db_available_files_add')
        return jsonify({'result': result})
    except Exception as e:
        app.logger.error("An error occurred: %s",str(e), exc_info=True)
        return jsonify({'error': 'An error occurred', 'details':str(e)}), 500
@app.route('/api/db/add_files', methods=['POST'])
def db_add_files():
    try:
        input_string = request.json.get('input_string')
        result = call_rpc_method('db_add_file')
        return jsonify({'result': result})
    except Exception as e:
        app.logger.error("An error occurred: %s",str(e), exc_info=True)
        return jsonify({'error': 'An error occurred', 'details':str(e)}), 500



@app.route('/api/best_players', methods=['GET'])
def get_best_players():
    return [{
        "id": "7674fe6a-6c8d-47b3-9a1f-18637771e23b",
        "name": "Ronaldo",
        "country": "Portugal",
        "position": "Striker",
        "imgUrl": "https://cdn-icons-png.flaticon.com/512/805/805401.png",
        "number": 7
    }]


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)
