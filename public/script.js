const boothContainer = document.getElementById("booth-container");
const boothCongestionMap = {};
const socket = new WebSocket('wss://solhyang.xyz');

function loadBooths() {
  boothContainer.innerHTML = "";

  fetch('booths.json')
    .then(response => response.json())
    .then(booths => {
      booths.forEach(booth => {
        const card = document.createElement("div");
        card.className = "booth-card";
        card.dataset.floor = booth.floor;
        card.dataset.type = booth.type;
          // 이 코드는 아래에서 제거한 코드임 나중에 삽입하셈
          card.innerHTML = `
          <img src="${booth.images[0]}" alt="부스 이미지" class="booth-image" />
          <div class="location">${booth.location}</div>
          <div class="congestion-level ${booth.congestion}">${getCongestionText(booth.congestion)}</div>
          <h2>${booth.name}</h2>
          <p style="font-size:12px">${booth.de}</p>
          <p style="font-size:10px">${booth.dong}</p>
        `;
        
        // 클릭 이벤트를 명시적으로 추가
        const imageElement = card.querySelector(".booth-image");
        imageElement.addEventListener("click", () => openSlider(booth.images));        

        boothContainer.appendChild(card);

        boothCongestionMap[booth.name] = booth.congestion;
      });
    })
    .catch(error => console.error('부스 데이터를 불러오는 중 오류 발생:', error));
}

function getCongestionText(level) {
  switch (level) {
    case "low": return "여유";
    case "medium": return "보통";
    case "high": return "혼잡";
    default: return "정보 없음";
  }
}

function filterBooths() {
  const floor = document.getElementById('floor-category').value;
  const type = document.getElementById('type-category').value;

  let anyVisible = false;

  Array.from(boothContainer.children).forEach(card => {
    const matchFloor = floor === 'all' || card.dataset.floor === floor;
    const cardTypes = card.dataset.type.split(',');
    const matchType = type === 'all' || cardTypes.includes(type);

    if (matchFloor && matchType) {
      card.style.display = 'block';
      anyVisible = true;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('no-results-message').style.display = anyVisible ? 'none' : 'block';
}


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


socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'initialData') {

    Object.entries(data.data).forEach(([boothName, congestion]) => {
      updateBoothCongestion(boothName, congestion);
    });
  } else if (data.type === 'statusUpdate') {

    const { boothId, status } = data;
    updateBoothCongestion(boothId, status);
  }
};

socket.onclose = () => {
  alert("서버와의 연결이 끊겼습니다. 새로고침을 하여 다시 연결해주세요!");
};

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

let currentImages = [];
let currentIndex = 0;

function openSlider(images) {
  currentImages = images;
  currentIndex = 0;

  if (currentImages.length > 0) {
    document.getElementById("slider-image").src = currentImages[currentIndex];
  }

  const slider = document.getElementById("image-slider");
  slider.style.display = "block";

  slider.querySelector(".slider-content").style.animation = "zoomIn 0.4s cubic-bezier(0.42, 0, 0.58, 1.0)";
}


function closeSlider() {
  const slider = document.getElementById("image-slider");
  slider.style.display = "none";
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

loadBooths();
