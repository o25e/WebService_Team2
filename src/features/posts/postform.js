// 날짜 선택 제한
document.getElementById("deadline-date").min = new Date().toISOString().split("T")[0];

// 카테고리 선택 함수
function selectCategory(type) {
    var categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(function(card) {
        card.classList.remove("active");
    });
    event.target.closest(".category-card").classList.add("active");
}

// 태그 입력 처리
var tagInput = document.getElementById("tag-input");
var tagContainer = document.getElementById("tag-container");

tagInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter" && tagInput.value.trim() !== "") {
        event.preventDefault();
        if (tagContainer.querySelectorAll(".tag-item").length < 5) {
            var tagItem = document.createElement("div");
            tagItem.className = "tag-item";
            tagItem.innerHTML = tagInput.value.trim() + 
                '<span class="tag-remove" onclick="this.parentElement.remove()">×</span>';
            tagContainer.insertBefore(tagItem, tagInput);
            tagInput.value = "";
        }
    }
});

// 이미지 업로드 처리
document.getElementById("file-input").addEventListener("change", function(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var uploadBox = document.getElementById("image-upload");
            uploadBox.innerHTML = '<img src="' + event.target.result + '" style="max-width: 100%; max-height: 100%;">';
        };
        reader.readAsDataURL(file);
    }
});

// 폼 제출 처리
document.getElementById("activity-form").addEventListener("submit", function(event) {
    event.preventDefault();

    var activityData = {
        title: document.querySelector("input[type='text']").value,
        category: document.querySelector(".category-card.active h3").textContent,
        personnel: document.querySelector("input[type='number']").value,
        deadline: document.getElementById("deadline-date").value,
        tags: Array.from(document.querySelectorAll(".tag-item")).map(function(tag) {
            return tag.textContent.trim().replace("×", "");
        }),
        description: document.querySelector("textarea").value,
        image: document.querySelector("#image-upload img") ? document.querySelector("#image-upload img").src : ""
    };

    var existingActivities = JSON.parse(localStorage.getItem("activities") || "[]");
    existingActivities.push(activityData);
    localStorage.setItem("activities", JSON.stringify(existingActivities));

    alert("활동이 정상적으로 등록되었습니다!");
    window.location.href = "main.html";
});
