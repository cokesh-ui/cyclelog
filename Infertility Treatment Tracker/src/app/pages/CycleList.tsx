import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, ChevronRight, User } from 'lucide-react';
import { Cycle } from '../types';
import * as api from '../api';

import { BottomNav } from '../components/BottomNav';
import { CycleProgress } from '../components/CycleProgress';

export default function CycleList() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cycleNumber, setCycleNumber] = useState(1);
  const [subtitle, setSubtitle] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    api.fetchCycles()
      .then((data) => {
        setCycles(data);
        if (searchParams.get('newCycle') === '1') {
          const nextNumber = data.length > 0 ? data[data.length - 1].cycleNumber + 1 : 1;
          setCycleNumber(nextNumber);
          setSubtitle('');
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
    setSubtitle('');
    setShowCreateModal(true);
  };

  const createNewCycle = async () => {
    try {
      const newCycle = await api.createCycle({
        cycleNumber,
        subtitle: subtitle.trim() || undefined,
        startDate: new Date().toISOString().split('T')[0],
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
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
        {/* 새 사이클 버튼 */}
        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-pink-600 border-2 border-pink-200 rounded-xl transition-all shadow-sm active:shadow-md active:scale-98"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">새 사이클 시작하기</span>
          </button>
        </div>

        {/* 사이클 리스트 */}
        {cycles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">아직 사이클이 없습니다.</p>
            <p className="text-sm mt-2">새 사이클을 시작해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...cycles].reverse().map((cycle) => {
              const medications = getMedicationSummary(cycle);

              return (
                <div
                  key={cycle.id}
                  onClick={() => navigate(`/cycle/${cycle.id}`)}
                  className="relative bg-white rounded-xl p-5 shadow-sm border border-pink-100 cursor-pointer hover:shadow-md hover:border-pink-200 transition-all overflow-hidden"
                >
                  {/* 왼쪽 컬러바 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500" />

                  {/* 상단: 제목, 날짜 */}
                  <div className="flex items-center justify-between mb-4 pl-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold">{cycle.cycleNumber ? `${cycle.cycleNumber}회` : (cycle.title || '제목 없음')}</div>
                        <div className="text-sm text-gray-500">{cycle.startDate}</div>
                      </div>
                      {cycle.subtitle && (
                        <div className="text-xs text-gray-500 ml-1">{cycle.subtitle}</div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* 처방약 정보 */}
                  {medications && medications.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-pink-100 pl-3">
                      <div className="text-xs text-gray-500 mb-2">처방약</div>
                      <div className="flex flex-wrap gap-2">
                        {medications.map((med) => (
                          <div
                            key={med.name}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-lg text-sm"
                          >
                            <span className="font-medium">{med.name}</span>
                            <span className="text-gray-600">{med.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 숫자 흐름 요약 */}
                  <div className="pl-3">
                    <div className="text-xs text-gray-500 mb-2">진행 과정</div>
                    <CycleProgress cycle={cycle} compact />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부제 (선택)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="예: 롱프로토콜, 단기프로토콜 등"
                />
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
                className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
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
