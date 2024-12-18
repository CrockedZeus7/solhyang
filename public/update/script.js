function getCongestionText(level) {
    switch (level) {
      case "low": return "여유";
      case "medium": return "보통";
      case "high": return "혼잡";
      default: return "정보 없음";
    }
  }

  const socket = new WebSocket('ws://localhost:8080');

  window.addEventListener('DOMContentLoaded', () => {
    fetch('../booths.json')
      .then(response => response.json())
      .then(booths => {
        const boothSelect = document.getElementById('booth-name');
        booths.forEach(booth => {
          const option = document.createElement('option');
          option.value = booth.name;
          option.textContent = booth.name;
          boothSelect.appendChild(option);
        });
      })
      .catch(error => console.error('부스 데이터를 불러오는 데 실패했어요. 새로고침을 해서 다시 시도해주세요.:', error));
  });

  function updateCongestion() {
    const boothName = document.getElementById('booth-name').value;
    const congestion = document.getElementById('congestion-level').value;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'updateStatus',
        boothId: boothName,
        status: congestion,
      }));

      alert(`${boothName}의 혼잡도가 ${getCongestionText(congestion)}로 업데이트됐어요!`);
    } else {
      alert('서버와의 연결이 끊겼습니다. 새로고침을 하여 다시 연결해주세요!');
    }
  }