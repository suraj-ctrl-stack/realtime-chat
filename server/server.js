// Import required libraries
const path = require('path');
const express = require('express'); // HTTP server framework
const WebSocket = require('ws'); // WebSocket library
const http = require('http'); // Native HTTP module (needed for WebSocket)

// Initialize Express app
const app = express();

// Create HTTP server by wrapping the Express app
// (WebSocket requires HTTP server, not Express directly)
const server = http.createServer(app);

// Create WebSocket server by attaching it to the HTTP server
const wss = new WebSocket.Server({ server });

// Store connected clients (optional, for advanced features)
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Add new client to tracking set
  clients.add(ws);

  // Message handler for this connection
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      // Check if the connection is still open
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server says: ${message}`);
      }
    });
  });

  // Cleanup on connection close
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Start the combined HTTP/WebSocket server
const PORT = 3001;
// Serve static files from the client directory
app.use(express.static('../client'));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});