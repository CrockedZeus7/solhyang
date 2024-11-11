function filterBooths() {
  const floor = document.getElementById('floor-category').value;
  const type = document.getElementById('type-category').value;
  const booths = document.querySelectorAll('.booth-card');
  let anyVisible = false;

  booths.forEach(booth => {
    const boothFloor = booth.getAttribute('data-floor');
    const boothType = booth.getAttribute('data-type');

    if ((floor === 'all' || boothFloor === floor) && (type === 'all' || boothType === type)) {
      booth.style.display = 'block';
      anyVisible = true;
    } else {
      booth.style.display = 'none';
    }
  });

  // 결과 없음 메시지 표시/숨기기
  document.getElementById('no-results-message').style.display = anyVisible ? 'none' : 'block';
}
