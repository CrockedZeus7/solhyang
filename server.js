// 서버 코드 (server.js)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const fs = require('fs');
const path = require('path');

const boothStatuses = {}; // 부스별 상태 저장 객체

wss.on('connection', (ws) => {
  console.log('새로운 클라이언트가 연결되었습니다.');

  // 접속한 클라이언트에게 현재 부스 상태를 전달
  ws.send(JSON.stringify({
    type: 'initialData',
    data: boothStatuses,
  }));

// 부스 상태 업데이트 처리
ws.on('message', (message) => {
  try {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'updateStatus') {
      const { boothId, status } = parsedMessage;

      // 부스 상태 업데이트
      boothStatuses[boothId] = status;

      // JSON 파일 수정
      const filePath = path.join(__dirname, 'public', 'booths.json');
      const boothsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const boothIndex = boothsData.findIndex((booth) => booth.name === boothId);

      if (boothIndex !== -1) {
        boothsData[boothIndex].congestion = status; // JSON 데이터 업데이트
        fs.writeFileSync(filePath, JSON.stringify(boothsData, null, 2), 'utf-8'); // 파일 저장
        console.log(`${boothId}의 혼잡도가 ${status}로 업데이트되었습니다.`);

        // 모든 클라이언트에게 업데이트 브로드캐스트
        broadcast(JSON.stringify({
          type: 'statusUpdate',
          boothId,
          status,
        }));
      } else {
        console.error('부스 ID를 찾을 수 없습니다.');
      }
    }
  } catch (error) {
    console.error('메시지 처리 중 오류 발생:', error);
  }
});

  
  ws.on('close', () => {
    console.log('클라이언트 연결이 종료되었습니다.');
  });
});


// 메시지를 모든 연결된 클라이언트에게 브로드캐스트
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// 서버 실행
const PORT = 8080;

// public 디렉토리 정적 파일 제공
app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});

