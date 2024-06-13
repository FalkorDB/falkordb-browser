from flask import Flask, request, jsonify
app = Flask(__name__)

from falkordb import FalkorDB
from graphrag_sdk.schema import Schema
from graphrag_sdk import KnowledgeGraph, Source

import logging
logger = logging.getLogger("graphrag_sdk")

# Configure the root logger
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

def set_openai_key(key):
    import os

    # Set the environment variable
    os.environ['OPENAI_API_KEY'] = key

@app.route('/detect_schema', methods=['POST'])
def detect_schema():
    # Get data from the POST request
    data = request.get_json()  # For JSON data

    if data is None:
        return jsonify({"error": "No data provided"}), 400

    # Process the data (for demonstration purposes, we'll just echo it back)
    host = data.get('host')
    port = data.get('port')
    name = data.get('name') + "_schema"
    srcs = data.get('srcs')
    key = data.get('openaikey')

    print(f"host: {host}")
    print(f"port: {port}")
    print(f"name: {name}")
    print(f"srcs: {srcs}")
    print(f"key : {key}")

    set_openai_key(key)

    sources = [Source(s) for s in srcs]
    s = Schema.auto_detect(sources)

    # Save schema to DB
    db = FalkorDB(host=host, port=port)
    g = db.select_graph(name)
    s.save_graph(g)
    print("Done!")

    response = { "schema": s.to_JSON() }
    return jsonify(response)

@app.route('/populate_kg', methods=['POST'])
def populate_kg():
    # Get data from the POST request
    data = request.get_json()  # For JSON data

    if data is None:
        return jsonify({"error": "No data provided"}), 400

    # Process the data (for demonstration purposes, we'll just echo it back)
    host = data.get('host')
    port = data.get('port')
    name = data.get('name')
    srcs = data.get('srcs')
    key = data.get('openaikey')

    print(f"host: {host}")
    print(f"port: {port}")
    print(f"name: {name}")
    print(f"srcs: {srcs}")
    print(f"key : {key}")

    set_openai_key(key)

    sources = [Source(s) for s in srcs]

    kg = KnowledgeGraph(name, host=host, port=port)
    kg.process_sources(sources)

    response = { "result": "OK" }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
