import sys
import json
import db_functions

from flask import Flask, request, jsonify

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 8080

app = Flask(__name__)
app.config["DEBUG"] = True


@app.route('/api/entity/<id>', methods=['PATCH'])
def update_sighting(id):
    try:
        data = json.loads(request.data)
        result = db_functions.update_sighting(data)
        if result == 1:
            return jsonify({"message": f"Sighting with ID {id} updated successfully", "data": ""})
        else:
            return jsonify({"error": f"Internal Server Error: Failed to update sightings table"}), 500
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500



@app.route('/api/tile', methods=['GET'])
def get_sightings_in_area():
    pass

@app.route('/', methods=['GET'])
def test():
    return "Hello, world!"


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)
