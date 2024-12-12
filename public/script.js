const boothContainer = document.getElementById("booth-container");
const boothCongestionMap = {};
const socket = new WebSocket('wss://usual-eugenia-bokdolyee-461d2b1d.koyeb.app');

// 부스 데이터 로드 함수
function loadBooths() {
  boothContainer.innerHTML = "";

  fetch('booths.json')
    .then(response => response.json())
    .then(booths => {
      booths.forEach(booth => {
        const card = document.createElement("div"); // `card`를 여기서 정의
        card.className = "booth-card";
        card.dataset.floor = booth.floor;
        card.dataset.type = booth.type;
          //<p>${booth.description}</p> 이 코드는 아래에서 제거한 코드임 나중에 삽입하셈
        card.innerHTML = `
          <img src="${booth.images[0]}" alt="부스 이미지" onclick="openSlider('${JSON.stringify(booth.images)}')" />
          <div class="location">${booth.location}</div>
          <div class="congestion-level ${booth.congestion}">${getCongestionText(booth.congestion)}</div>
          <h2>${booth.name}</h2>
          <p style="font-size:12px">${booth.dong}</p>
        `;

        boothContainer.appendChild(card);

        // 초기 혼잡도 매핑
        boothCongestionMap[booth.name] = booth.congestion;
      });
    })
    .catch(error => console.error('부스 데이터를 불러오는 중 오류 발생:', error));
}


// 혼잡도 텍스트 반환 함수
function getCongestionText(level) {
  switch (level) {
    case "low": return "여유";
    case "medium": return "보통";
    case "high": return "혼잡";
    default: return "정보 없음";
  }
}

// 필터링 함수
function filterBooths() {
  const floor = document.getElementById('floor-category').value;
  const type = document.getElementById('type-category').value;

  let anyVisible = false;
  Array.from(boothContainer.children).forEach(card => {
    const matchFloor = floor === 'all' || card.dataset.floor === floor;
    const matchType = type === 'all' || card.dataset.type === type;

    if (matchFloor && matchType) {
      card.style.display = 'block';
      anyVisible = true;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('no-results-message').style.display = anyVisible ? 'none' : 'block';
}

// 혼잡도 업데이트 함수
function updateBoothCongestion(boothName, congestion) {
  const card = Array.from(boothContainer.children).find(
    (card) => card.querySelector("h2").innerText === boothName
  );

  if (card) {
    const congestionElement = card.querySelector(".congestion-level");
    congestionElement.textContent = getCongestionText(congestion);
    congestionElement.className = `congestion-level ${congestion}`;
  }
}


// WebSocket 메시지 수신 처리
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'initialData') {
    // 초기 데이터 로드
    Object.entries(data.data).forEach(([boothName, congestion]) => {
      updateBoothCongestion(boothName, congestion);
    });
  } else if (data.type === 'statusUpdate') {
    // 상태 업데이트 처리
    const { boothId, status } = data;
    updateBoothCongestion(boothId, status);
  }
};

// WebSocket 연결 종료 시 알림 표시
socket.onclose = () => {
  alert("이런.. 서버와의 연결이 끊겼어요. 새로고침을 하여 다시 시도해주세요!");
};
// 부스 혼잡도 업데이트 함수
function updateBoothCongestion(boothName, congestion) {
  const card = Array.from(boothContainer.children).find(
    (card) => card.querySelector("h2").innerText === boothName
  );

  if (card) {
    const congestionElement = card.querySelector(".congestion-level");
    congestionElement.textContent = getCongestionText(congestion);
    congestionElement.className = `congestion-level ${congestion}`;
  }
}

// 이미지 슬라이더 기능
let currentImages = [];
let currentIndex = 0;

// 슬라이더 열기 함수 수정
function openSlider(images) {
  currentImages = JSON.parse(images); // JSON 문자열을 파싱
  currentIndex = 0;

  if (currentImages.length > 0) {
    document.getElementById("slider-image").src = currentImages[currentIndex];
  }
  document.getElementById("image-slider").style.display = "block";
}

function closeSlider() {
  document.getElementById("image-slider").style.display = "none";
}

function prevImage() {
  if (currentImages.length > 0) {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    document.getElementById("slider-image").src = currentImages[currentIndex];
  }
}

function nextImage() {
  if (currentImages.length > 0) {
    currentIndex = (currentIndex + 1) % currentImages.length;
    document.getElementById("slider-image").src = currentImages[currentIndex];
  }
}

// 초기 로드
loadBooths();
