// WebSocket client for CryptoBot application
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000; // 3 seconds

type MessageHandler = (data: any) => void;
const messageHandlers: Record<string, MessageHandler[]> = {};

// Connect to WebSocket server
export function connect(): WebSocket | null {
  try {
    // Close existing connection if any
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }

    // Determine WebSocket protocol and URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    console.log(`Connecting to WebSocket server at ${wsUrl}`);
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      // Reset reconnect attempts on successful connection
      reconnectAttempts = 0;
      
      // Send a ping to verify connection
      send({ type: "ping" });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        // Handle message based on type
        if (data.type && messageHandlers[data.type]) {
          messageHandlers[data.type].forEach(handler => handler(data));
        }
        
        // Also trigger general message handlers
        if (messageHandlers["*"]) {
          messageHandlers["*"].forEach(handler => handler(data));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      
      // Try to reconnect if not a clean close
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(connect, RECONNECT_INTERVAL);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Don't close here, let the onclose handler deal with reconnection
    };
    
    return socket;
  } catch (error) {
    console.error("Failed to establish WebSocket connection:", error);
    return null;
  }
}

// Send a message to the server
export function send(data: any): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("Cannot send message: WebSocket is not connected");
    return false;
  }
  
  try {
    socket.send(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error sending WebSocket message:", error);
    return false;
  }
}

// Subscribe to message types
export function subscribe(type: string, handler: MessageHandler): () => void {
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  
  messageHandlers[type].push(handler);
  
  // Return unsubscribe function
  return () => {
    messageHandlers[type] = messageHandlers[type].filter(h => h !== handler);
  };
}

// Check if socket is connected
export function isConnected(): boolean {
  return socket !== null && socket.readyState === WebSocket.OPEN;
}

// Cleanly disconnect
export function disconnect(): void {
  if (socket) {
    socket.close(1000, "Client disconnected");
    socket = null;
  }
}

// Initialize connection on load but with error handling
export function initializeWebSocket(): void {
  try {
    connect();
  } catch (error) {
    console.error("Failed to initialize WebSocket:", error);
  }
}