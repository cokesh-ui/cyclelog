import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, ChevronRight, User, X, Syringe } from 'lucide-react';
import { Cycle } from '../types';
import * as api from '../api';

import { BottomNav } from '../components/BottomNav';
import { CycleProgress } from '../components/CycleProgress';
import { MockAd } from '../components/MockAd';

export default function CycleList() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cycleNumber, setCycleNumber] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [cycleType, setCycleType] = useState<'standard' | 'transfer_only'>('standard');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    api.fetchCycles()
      .then((data) => {
        setCycles(data);
        if (searchParams.get('newCycle') === '1') {
          const nextNumber = data.length > 0 ? data[data.length - 1].cycleNumber + 1 : 1;
          setCycleNumber(nextNumber);
          setTags([]);
          setTagInput('');
          setShowCreateModal(true);
          setSearchParams({}, { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCreateModal = () => {
    const lastCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;
    const nextNumber = lastCycle && lastCycle.cycleNumber ? lastCycle.cycleNumber + 1 : 1;
    setCycleNumber(nextNumber);
    setTags([]);
    setTagInput('');
    setCycleType('standard');
    setShowCreateModal(true);
  };

  const createNewCycle = async () => {
    try {
      const newCycle = await api.createCycle({
        cycleNumber,
        subtitle: tags.length > 0 ? tags.join(' ') : undefined,
        startDate: new Date().toISOString().split('T')[0],
        cycleType,
      });
      setCycles([...cycles, newCycle]);
      setShowCreateModal(false);
      navigate(`/cycle/${newCycle.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getMedicationSummary = (cycle: Cycle) => {
    if (cycle.injections.length === 0) return null;

    const medMap = new Map<string, Set<string>>();
    cycle.injections.forEach((inj) => {
      if (!medMap.has(inj.medicationName)) {
        medMap.set(inj.medicationName, new Set());
      }
      medMap.get(inj.medicationName)!.add(inj.dosage);
    });

    return Array.from(medMap.entries()).map(([name, dosages]) => ({
      name,
      dosage: Array.from(dosages).join(', '),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-800">
            사이클로그 <span className="text-xs font-normal text-gray-500">착붙는 여정의 기록</span>
          </h1>
          <button onClick={() => navigate('/mypage')} className="p-1 text-gray-500 active:bg-gray-100 rounded transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* 사이클 리스트 */}
        {cycles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">당신의 착붙는 여정</p>
            <p className="text-sm mt-2">한 걸음씩, 사이클로그와 기록을 시작해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...cycles].reverse().map((cycle, index) => {
              const medications = getMedicationSummary(cycle);

              return (
                <div key={cycle.id} className="space-y-4">
                {/* 2번째 카드 뒤에 인피드 광고 */}
                {/* {index === 2 && <MockAd />} */}
                <div
                  onClick={() => navigate(`/cycle/${cycle.id}`)}
                  className="relative bg-white rounded-xl px-5 py-4 shadow-sm border border-orange-100 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all overflow-hidden"
                >
                  {/* 왼쪽 컬러바 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />

                  {/* 상단: 제목, 날짜 */}
                  <div className="flex items-center justify-between mb-3 pl-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold">{cycle.cycleNumber ? `${cycle.cycleNumber}회` : (cycle.title || '제목 없음')}</div>
                        <div className="text-sm text-gray-500">{cycle.startDate}</div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cycle.cycleType === 'transfer_only' && (
                          <span className="text-xs text-orange-500">#이식만</span>
                        )}
                        {cycle.subtitle && cycle.subtitle.split(/\s+/).map((tag, i) => (
                          <span key={i} className="text-xs text-gray-400">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {(!medications || medications.length === 0) && !cycle.retrieval && !cycle.fertilization && !cycle.culture && !cycle.transfer && !cycle.freeze && !cycle.pgt && (
                        <span className="text-sm text-gray-400">사이클로그를 입력하세요</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* 처방약 정보 */}
                  {medications && medications.length > 0 && (
                    <div className="mb-2 pl-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Syringe className="w-3.5 h-3.5 text-pink-500" />
                        처방약
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {medications.map((med) => (
                          <div
                            key={med.name}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg text-sm"
                          >
                            <span className="font-medium">{med.name}</span>
                            <span className="text-gray-600">{med.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 숫자 흐름 요약 - 데이터가 있을 때만 표시 */}
                  {(cycle.injections.length > 0 || cycle.retrieval || cycle.fertilization || cycle.culture || cycle.transfer || cycle.freeze || cycle.pgt) && (
                    <div className="pl-3">
                      <CycleProgress cycle={cycle} compact hideInjection />
                    </div>
                  )}
                </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 플로팅 + 버튼 */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center active:bg-orange-600 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

      <BottomNav />

      {/* 새 사이클 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">새 사이클 시작</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회차 *
                </label>
                <input
                  type="number"
                  min="1"
                  value={cycleNumber}
                  onChange={(e) => setCycleNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택)
                </label>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 text-sm rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                          className="text-orange-400 hover:text-orange-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(' ')) {
                        const word = val.replace(/\s/g, '').replace(/^#/, '');
                        if (word && !tags.includes(word)) {
                          setTags([...tags, word]);
                        }
                        setTagInput('');
                      } else {
                        setTagInput(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        const word = tagInput.trim().replace(/^#/, '');
                        if (word && !tags.includes(word)) {
                          setTags([...tags, word]);
                        }
                        setTagInput('');
                      }
                      if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                        setTags(tags.slice(0, -1));
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="병원명, 프로토콜 등"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사이클 유형
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-orange-50 ${
                      cycleType === 'standard' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cycleType"
                      checked={cycleType === 'standard'}
                      onChange={() => setCycleType('standard')}
                      className="accent-orange-500"
                    />
                    <div>
                      <div className="font-medium text-sm">채취부터 진행해요</div>
                      <div className="text-xs text-gray-500">과배란 → 채취 → 수정 → 배양 → 이식/동결/PGT</div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-orange-50 ${
                      cycleType === 'transfer_only' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cycleType"
                      checked={cycleType === 'transfer_only'}
                      onChange={() => setCycleType('transfer_only')}
                      className="accent-orange-500"
                    />
                    <div>
                      <div className="font-medium text-sm">이식만 진행해요</div>
                      <div className="text-xs text-gray-500">자궁내막준비 → 이식</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={createNewCycle}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
