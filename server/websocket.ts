import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// Store active connections
const clients: Set<WebSocket> = new Set();

export function setupWebSocketServer(server: Server): void {
  // Create WebSocket server on a different path to avoid conflicts with Vite's HMR
  const wss = new WebSocketServer({ 
    server, 
    path: '/api/ws' // Different path than Vite's HMR websocket
  });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to CryptoBot WebSocket Server'
    }));
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
        else if (data.type === 'subscribe') {
          // Subscribe logic here
          ws.send(JSON.stringify({ 
            type: 'subscription',
            status: 'success',
            channel: data.channel
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  console.log('WebSocket server set up on path: /api/ws');
}

// Broadcast to all connected clients
export function broadcast(data: any): void {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Check if a client is connected
export function hasConnections(): boolean {
  return clients.size > 0;
}

// Get count of connected clients
export function getConnectionCount(): number {
  return clients.size;
}