import xmlrpc.client

from flask import jsonify

RPC_SERVER_URL = "http://rpc-server:9000"
PROXY = xmlrpc.client.ServerProxy(RPC_SERVER_URL, allow_none=True)


def test_connection():
    conn = PROXY.test_connection()
    return jsonify({'message': f"{conn}"})


def add_file(file):
    files = PROXY.db_available_files_add()
    if files:
        if file in files:
            result = PROXY.db_addfiles(file)
            if result == 1:
                return jsonify({'message': f"Request to add {file} was successful"})
            else:
                return jsonify({'error': "Server failed to handle request"})
        else:
            return jsonify({'error': f"{file} is not in the list of available files"})
    else:
        return jsonify({'message': "All files are active"})


def delete_file(file):
    files = PROXY.db_available_files_delete()
    if files:
        if file in files:
            result = PROXY.db_delete(file)
            if result == 1:
                return jsonify({'message': f"Request to delete {file} was successful"})
            else:
                return jsonify({'error': "Server failed to handle request"})
        else:
            return jsonify({'error': f"{file} is not in the list of available files"})
    else:
        return jsonify({'message': "All files are deleted"})


def get_number_sightings_in_year(year):
    arr = []
    data = PROXY.get_number_sightings_in_year(year, 1)
    if data:
        for info in data:
            arr.append({'data': {
                'YEAR': year,
                'XML_FILE': info['file_name'],
                'COUNT': info['count']
            },
            })
        return jsonify(arr)
    else:
        return jsonify({'message': 'No matches found for requested year'})


def get_number_sightings_group_by_year():
    arr = []
    data = PROXY.get_number_sightings_group_by_year(0)
    if data:
        for info in data:
            arr.append({'data': {
                'YEAR': info['year'],
                'COUNT': info['count']
            },
            })
        return jsonify(arr)
    else:
        return jsonify({'message': 'No matches found'})


# ordenar por file_name
def retrieve_shape_month(shape, month):
    arr = []
    data = PROXY.retrieve_shape_month(shape, month, 0)
    if data:
        for key, group in data.items():
            for item in group:
                arr.append({'data': {
                    'FILE NAME': key,
                    'YEAR': item['year'],
                    'REGION': item['region'],
                    'ENCOUNTER DURATION': item['encounter_duration'],
                    'DESCRIPTION': item['description']
                },
                })
        print(arr)
        return jsonify(arr)
    else:
        return jsonify({'message': 'No matches found for requested shape and month'})


def retrieve_year_region(region, year):
    arr = []
    data = PROXY.retrieve_year_region(region, year, 1)
    if data:
        for info in data:
            arr.append({'data': {
                'UFO SHAPE': info['ufo_shape'],
                'ENCOUNTER DURATION': info['encounter_duration'],
                'DESCRIPTION': info['description']
            },
            })
        return jsonify(arr)
    else:
        return jsonify({'message': 'No matches found for requested region and year'})


# ordenar por file name
def retrieve_shape_region(shape):
    arr = []
    data = PROXY.retrieve_shape_region(shape, 0)
    if data:
        for key, group in data.items():
            for item in group:
                arr.append({'data': {
                    'FILE NAME': key,
                    'REGION': item['region'],
                    'UFOs SIGHTINGS': item['UFOs_sightings']
                },
                })
        return jsonify(arr)
    else:
        return jsonify({'message': 'No matches found for requested shape'})
