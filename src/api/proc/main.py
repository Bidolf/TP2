import sys
import rpc_client
from flask import Flask

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 8080

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route('/test_conn', methods=['GET'])
def test_conn():
    result = rpc_client.test_connection()
    return result


@app.route('/add_file/<file_name>', methods=['PATCH'])
def add_file(file_name):
    result = rpc_client.add_file(file_name)
    return result


@app.route('/delete_file/<file_name>', methods=['PATCH'])
def delete_file(file_name):
    result = rpc_client.delete_file(file_name)
    return result


@app.route('/get_number_sightings_in_year/<year>', methods=['GET'])
def get_number_sightings_in_year(year):
    result = rpc_client.get_number_sightings_in_year(year)
    return result


@app.route('/get_number_sightings_group_by_year', methods=['GET'])
def get_number_sightings_group_by_year():
    result = rpc_client.get_number_sightings_group_by_year()
    return result


@app.route('/retrieve_shape_month/<shape>/<month>', methods=['GET'])
def retrieve_shape_month(shape, month):
    result = rpc_client.retrieve_shape_month(shape, month)
    return result


@app.route('/retrieve_year_region/<region>/<year>', methods=['GET'])
def retrieve_year_region(region, year):
    result = rpc_client.retrieve_year_region(region, year)
    return result


@app.route('/retrieve_shape_region/<shape>', methods=['GET'])
def retrieve_shape_region(shape):
    result = rpc_client.retrieve_shape_region(shape)
    return result


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)
