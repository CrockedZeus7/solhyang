const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

// 서버 설정
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// lastMessage 변수 추가 (최근 메시지 저장)
let lastMessage = null;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    console.log('클라이언트 연결됨.');

    // 새로 연결된 클라이언트에게 마지막 메시지 전송
    if (lastMessage) {
        ws.send(JSON.stringify(lastMessage));
    }

    // 메시지 수신 처리
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`수신된 메시지: ${message}`);
        
        // 마지막 메시지 저장
        lastMessage = data;

        // 모든 클라이언트에 메시지 브로드캐스트
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        console.log('클라이언트 연결이 종료됨.');
    });
});

// 서버 시작
server.listen(8080, () => {
    console.log('서버가 http://localhost:8080 에서 실행 중입니다.');
});
