from enum import Enum
import uuid
from typing import List
from graphrag_sdk import Source

class Operation(Enum):
    SCHEMA_DETECTION = 1
    KNOWLEDGE_GRAPH_POPULATE = 2

class SourceStatus(Enum):
    UNHANDELED = 1
    PROCESSED = 2
    ERRORED = 3

class Task():
    def __init__(self, op: Operation, srcs: List[Source], key: str,
                 host: str, port: int, name: str):
        self.op = op
        self.key = key
        self.srcs = srcs
        self.host = host
        self.port = port 
        self.name = name

        # Generate a UUID based on RFC 4122
        self.token = str(uuid.uuid4())

        for s in self.srcs:
            s.status = SourceStatus.UNHANDELED

    def SourceUpdateStatus(self, src: Source, status: SourceStatus) -> None:
        idx = self.srcs.index(src)
        self.srcs[idx].status = status

    def Progress(self):
        return sum(1 for t in self.srcs if t.status != SourceStatus.UNHANDELED) / len(self.srcs)

