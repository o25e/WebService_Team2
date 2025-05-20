export default function SmallClub(): string {
    return `
    <!-- 메인 소모임 목록 -->
    <main>
        <!-- 소모임 카드 -->
        <div class="w-3xl mx-auto flex flex-col bg-white shadow-lg overflow-hidden">
            <!-- 이미지와 정보 묶음 -->
            <div class="flex px-4">
                <!-- 이미지와 상태 -->
                <div class="w-40 h-40 relative">
                    <img src="/src/assets/gameworks.png" alt="이미지" class="rounded-xl object-cover">
                    <div class="absolute top-1 left-1 bg-white text-black text-xs px-1 py-1 rounded-md">
                        <span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        모집중
                    </div>
                    <div class="absolute top-1 right-1 bg-white text-black text-xs px-1 py-1 rounded-md">마감 D-17</div>
                </div>

                <!-- 소모임 정보 -->
                <div class="flex-grow p-4 space-y-2 flex flex-col">
                    <h2 class="text-xl font-semibold text-gray-800">소모임 이름</h2>
                    <p class="text-gray-600 text-sm">소모임 설명</p>

                    <div class="flex flex-col text-sm text-gray-700">
                        <div class="flex gap-2">
                            <span class="font-medium">모집 기간</span>
                            <span>2025.05.01 ~ 2025.05.11</span>
                        </div>
                    </div>
                    <!-- 해시태그들 -->
                    <div class="mt-auto flex flex-wrap gap-2">
                        <span class="bg-blue-100 text-gray-700 text-xs px-2 py-1 rounded-full">#디자인</span>
                        <span class="bg-blue-100 text-gray-700 text-xs px-2 py-1 rounded-full">#화목</span>
                        <!-- 추가 해시태그 -->
                    </div>
                </div>                
            </div>


            <!-- 최신 글 -->
            <div class="px-4 py-4 pb-4">
                <h3 class="text-lg font-semibold text-gray-800">최신 글</h3>
                <hr class="my-2">

                <!-- 게시글 -->
                <div class="space-y-1 text-sm text-gray-700">
                    <div class="flex justify-between">
                        <span>소모임 모집</span>
                        <span>2025.05.01</span>
                    </div>
                    <hr>
                </div>
                <!-- 추가 게시글 -->
            </div>
        </div>


        <!-- 추가 카드... -->
    </main>
    `;
}