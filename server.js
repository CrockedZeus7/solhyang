const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

// Initialize congestion data for each booth
const congestionData = {};

server.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Update congestion data for the specified booth
    congestionData[data.boothName] = data.congestion;

    // Broadcast the updated congestion data to all connected clients
    const updateMessage = JSON.stringify(data);
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(updateMessage);
      }
    });
  });

  // Send initial congestion data when a client connects
  ws.send(JSON.stringify(congestionData));
});

console.log('WebSocket server is running on port 8080');
