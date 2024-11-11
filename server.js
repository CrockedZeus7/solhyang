// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
  console.log('클라이언트가 연결되었습니다.');

  // 클라이언트로부터 혼잡도 업데이트 메시지 수신
  socket.on('message', message => {
    const data = JSON.parse(message);
    console.log(`부스: ${data.boothName}, 혼잡도: ${data.congestion}`);

    // 연결된 모든 클라이언트에게 메시지 전송
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});

console.log('WebSocket 서버가 포트 8080에서 실행 중입니다.');
