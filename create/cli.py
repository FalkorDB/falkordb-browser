from flask import Flask, request, jsonify
app = Flask(__name__)

import threading
from task import Task, SourceStatus, Operation
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

# List of tasks
tasks = {}

def Add_Task(task: Task) -> None:
    logger.debug(f"Task added, token: {task.token}")
    tasks[task.token] = task

def Remove_Task(task: Task) -> None:
    if task.token in tasks:
        logger.debug(f"Task removed, token: {task.token}")
        del tasks[task.token]

def set_openai_key(key):
    import os
    # Set the environment variable
    os.environ['OPENAI_API_KEY'] = key

def _detect_schema(task: Task) -> None:
    logger.debug(f"task: {task}")
    logger.debug(f"Running detect schema in a dedicated thread")
    set_openai_key(task.key)
    print(f"task.key: {task.key}")

    s = Schema.auto_detect(task.srcs)

    # Update all sources at once
    for src in task.srcs:
        task.SourceUpdateStatus(src, SourceStatus.PROCESSED)

    # Save schema to DB
    db = FalkorDB(host=task.host, port=task.port)
    g = db.select_graph(task.name)
    s.save_graph(g)

    logger.info('Done detecting schema')

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
    key  = data.get('openaikey')

    sources = [Source(s) for s in srcs]

    task = Task(Operation.SCHEMA_DETECTION, sources, key, host, port, name)
    Add_Task(task)

    threading.Thread(target=_detect_schema, args=(task,)).start()

    response = { "token": task.token }
    return jsonify(response)

def _populate_kg_from_src(kg: KnowledgeGraph, task: Task, src: Source) -> None:
    logger.info('Populating Knowledge Graph from src')
    kg.process_sources([src])
    task.SourceUpdateStatus(src, SourceStatus.PROCESSED)

def _populate_kg(task: Task):
    logger.info('Populating Knowledge Graph')

    set_openai_key(task.key)

    kg = KnowledgeGraph(task.name, host=task.host, port=task.port)

    for src in task.srcs:
        threading.Thread(target=_populate_kg_from_src, args=(kg, task, src,)).start()

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

    sources = [Source(s) for s in srcs]

    task = Task(Operation.KNOWLEDGE_GRAPH_POPULATE, sources, key, host, port, name)
    Add_Task(task)

    threading.Thread(target=_populate_kg, args=(task,)).start()

    response = { "token": task.token }
    return jsonify(response)

@app.route('/pull_status', methods=['GET'])
def get_status():
    print("GET /pull_status")
    # Get data from the GET request
    token = request.args.get('token')

    if token is None:
        return jsonify({"error": "No token provided"}), 400 

    # Get task
    if token not in tasks:
        return jsonify({"error": "Unknown token"}), 400

    task = tasks[token]
    progress = task.Progress()

    if progress == 1:
        # Stop tracking
        Remove_Task(task)

    response = { "progress": progress }
    return response

if __name__ == '__main__':
    app.run(debug=True)
