const input = document.getElementById('imageInput');
const button = document.getElementById('customBtn');
const dropArea = document.getElementById('dropArea');
const preview = document.getElementById('preview');
const dropText = document.getElementById('dropText');

// 📁 커스텀 버튼 클릭 → input 클릭
button.addEventListener('click', () => input.click());

// 📁 input에서 파일 선택했을 때
input.addEventListener('change', () => {
  if (input.files.length > 0) {
    showPreview(input.files[0]);
  }
});

// 🎯 드래그 이벤트 기본 방지
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// 🎨 드래그 중 스타일 변경
dropArea.addEventListener('dragover', () => dropArea.classList.add('dragover'));
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));

// 📦 드롭 처리
dropArea.addEventListener('drop', e => {
  dropArea.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(files[0]);
    input.files = dataTransfer.files; // input에 반영

    showPreview(files[0]);
  }
});

// 🖼️ 이미지 미리보기 함수
function showPreview(file) {
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = 'block';
    dropText.textContent = '이미지가 선택되었습니다';
  };
  reader.readAsDataURL(file);
}