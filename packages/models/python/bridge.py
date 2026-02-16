#!/usr/bin/env python3
"""
Zeo Persistent Inference Worker
Reduces hotpath latency by avoiding PyMC/Theano re-init overhead.
Protocol: Simple JSON-RPC over stdin/stdout.
"""

import sys
import json
import time
import os
import signal
from typing import Dict, Any

# Delay expensive imports until actually needed for the worker loop
import numpy as np

def process_single_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    # We'll import the business logic from the existing inference script
    # but here we can keep things in memory if we wanted to (e.g. shared priors)
    from inference import process_request
    return process_request(request_data)

def main():
    # Force line-buffered output
    sys.stdout.reconfigure(line_buffering=True)

    # Handle graceful shutdown
    def handle_exit(sig, frame):
        sys.exit(0)
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            result = process_single_request(request)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({
                "success": False,
                "error": f"Bridge internal error: {str(e)}",
                "computationTime": 0
            }))

if __name__ == "__main__":
    # Add parent dir to path so we can import inference.py
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    main()
