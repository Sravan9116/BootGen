from fastapi import WebSocket
from typing import List
import json

class ConnectionManager:
    def __init__(self):
        # Store active WebSocket connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                # Automatically clean up disconnected clients
                self.disconnect(connection)

# Global instance of WebSocket ConnectionManager
manager = ConnectionManager()
