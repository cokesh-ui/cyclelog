/**
 * 목업 광고 컴포넌트 — AdSense 적용 전 레이아웃 확인용
 * 실제 AdSense 연동 시 이 컴포넌트를 교체
 */
export function MockAd() {
  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-dashed border-gray-300 overflow-hidden">
      <div className="flex items-center gap-3">
        {/* 썸네일 자리 */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <div className="text-2xl text-gray-300">AD</div>
        </div>
        {/* 텍스트 영역 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-gray-400 border border-gray-300 rounded px-1">광고</span>
            <span className="text-xs text-gray-400">스폰서</span>
          </div>
          <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
          <div className="h-3 bg-gray-50 rounded w-full mb-1" />
          <div className="h-3 bg-gray-50 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

/**
 * 멀티플렉스 목업 광고 — 2x2 그리드 추천 콘텐츠 스타일
 */
export function MockMultiplexAd() {
  const items = [
    { label: '난임 영양제 추천' },
    { label: '시술 후 관리법' },
    { label: '착상 잘 되는 음식' },
    { label: '난임 보험 비교' },
  ];

  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-dashed border-gray-300 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[10px] text-gray-400 border border-gray-300 rounded px-1">광고</span>
        <span className="text-xs text-gray-400">추천 콘텐츠</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg text-gray-300">AD</span>
            </div>
            <span className="text-xs text-gray-500 leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
