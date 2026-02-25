import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MoreVertical, X } from 'lucide-react';
import { Cycle } from '../types';
import * as api from '../api';
import { InjectionSection } from '../components/InjectionSection';
import { RetrievalSection } from '../components/RetrievalSection';
import { FertilizationSection } from '../components/FertilizationSection';
import { EmbryoCultureSection } from '../components/EmbryoCultureSection';
import { TransferSection } from '../components/TransferSection';
import { FreezeSection } from '../components/FreezeSection';
import { PGTSection } from '../components/PGTSection';
import { BottomNav } from '../components/BottomNav';
import { CycleProgress } from '../components/CycleProgress';
import { MockAd, MockMultiplexAd } from '../components/MockAd';

export default function CycleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCycleNumber, setEditCycleNumber] = useState(1);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // 섹션 ref들
  const injectionRef = useRef<HTMLDivElement>(null);
  const retrievalRef = useRef<HTMLDivElement>(null);
  const fertilizationRef = useRef<HTMLDivElement>(null);
  const cultureRef = useRef<HTMLDivElement>(null);
  const pgtRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // 스크롤 감지 (cycle 로드 후 ref가 연결되면 실행)
  // 히스테리시스: 내려갈 때 30px 이상이면 축소, 올라갈 때 5px 이하면 확대
  // → 경계에서 떨림 방지
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const top = el.scrollTop;
      setIsScrolled(prev => {
        if (!prev && top > 30) return true;
        if (prev && top < 5) return false;
        return prev;
      });
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [cycle]);

  useEffect(() => {
    if (!id) return;
    api.fetchCycle(id).then((found) => {
      setCycle(found);
      setTimeout(() => {
        if (progressRef.current) {
          const scrollContainer = progressRef.current.querySelector('.overflow-x-auto');
          if (scrollContainer) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;
          }
        }
        focusNextStep(found);
      }, 100);
    }).catch(() => {
      navigate('/');
    });
  }, [id, navigate]);

  const focusNextStep = (cycle: Cycle) => {
    let targetRef: React.RefObject<HTMLDivElement | null> | null = null;
    const cultureData = cycle.culture;

    const hasInjections = cycle.injections.length > 0 || cycle.injectionSkipped;
    const isTransferOnly = cycle.cycleType === 'transfer_only';

    if (!hasInjections) {
      targetRef = injectionRef;
    } else if (isTransferOnly) {
      targetRef = null;
    } else if (!cycle.retrieval) {
      targetRef = retrievalRef;
    } else if (!cycle.fertilization) {
      targetRef = fertilizationRef;
    } else if (!cultureData) {
      targetRef = cultureRef;
    } else if (cultureData.nextPlans?.includes('pgt') && !cycle.pgt) {
      targetRef = pgtRef;
    }

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement | null>) => {
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 사이클 새로 고침 (API에서 최신 데이터 가져오기)
  const refreshCycle = async () => {
    if (!id) return;
    const updated = await api.fetchCycle(id);
    setCycle(updated);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말로 이 사이클을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.');
    if (confirmDelete && id) {
      await api.deleteCycle(id);
      setShowMenu(false);
      navigate('/');
    }
  };

  const openEditModal = () => {
    if (!cycle) return;
    setEditCycleNumber(cycle.cycleNumber || 1);
    const tags = cycle.subtitle ? cycle.subtitle.split(/\s+/).map(t => t.replace(/^#/, '')) : [];
    setEditTags(tags);
    setEditTagInput('');
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleEditCycle = async () => {
    if (!id) return;
    try {
      await api.updateCycleMeta(id, {
        cycleNumber: editCycleNumber,
        subtitle: editTags.length > 0 ? editTags.join(' ') : '',
      });
      await refreshCycle();
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  const cultureData = cycle.culture;
  const hasInjections = cycle.injections.length > 0 || cycle.injectionSkipped;
  const isTransferOnly = cycle.cycleType === 'transfer_only';

  const getStartDate = () => {
    if (cycle.injections.length === 0) return cycle.startDate;
    const dates = cycle.injections.map(inj => inj.date);
    return dates.sort()[0];
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-orange-50 to-amber-50">
      {/* 헤더 - 고정 */}
      <div className="flex-shrink-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-1 text-gray-700 active:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center gap-0">
            <h1 className="text-base font-bold text-gray-800">
              {cycle?.cycleNumber ? `${cycle.cycleNumber}회` : (cycle?.title || '사이클 보기')}
            </h1>
            {cycle?.subtitle && (
              <span className="text-xs text-gray-500">{cycle.subtitle}</span>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-700 active:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={openEditModal}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 active:bg-gray-100 transition-colors"
                  >
                    사이클 수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 active:bg-red-50 transition-colors"
                  >
                    사이클 삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 진행 과정 - 고정 */}
      <div className={`flex-shrink-0 px-4 ${isScrolled ? 'py-1' : 'py-3'} border-b border-orange-50 transition-all duration-200`} ref={progressRef}>
        <div className="max-w-4xl mx-auto">
          {!isScrolled && (
            <div className="flex items-end justify-end mb-2 px-1">
              <span className="text-xs text-gray-500">시작일: {getStartDate()}</span>
            </div>
          )}
          <CycleProgress
            cycle={cycle}
            shrink={isScrolled}
            onStepClick={(step) => {
              const stepMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
                injection: injectionRef,
                retrieval: retrievalRef,
                fertilization: fertilizationRef,
                culture: cultureRef,
                pgt: pgtRef,
              };
              const ref = stepMap[step];
              if (ref) scrollToSection(ref);
            }}
          />
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto" ref={contentRef}>
        <div className="max-w-4xl mx-auto px-4 py-3 pb-24 space-y-3">
          <div ref={injectionRef}>
            <InjectionSection
              injections={cycle.injections}
              cycleId={cycle.id}
              injectionSkipped={cycle.injectionSkipped}
              onUpdate={(injections) => {
                setCycle({ ...cycle, injections });
              }}
              onSkip={async () => {
                const updated = await api.skipInjections(cycle.id);
                setCycle(updated);
              }}
            />
          </div>

          {/* 다음 섹션이 아직 없을 때 여백에 광고 표시 */}
          {/* {!hasInjections && <MockAd />} */}

          {/* 이식만 진행: 처방 → 이식 */}
          {isTransferOnly && hasInjections && (
            <TransferSection
              transfer={cycle.transfer}
              onUpdate={async (transfer) => {
                const updated = await api.upsertTransfer(cycle.id, transfer);
                setCycle(updated);
              }}
            />
          )}

          {/* 일반 흐름: 처방 → 채취 → 수정 → 배양 → 이식/동결/PGT */}
          {!isTransferOnly && hasInjections && (
            <div ref={retrievalRef}>
              <RetrievalSection
                retrieval={cycle.retrieval}
                onUpdate={async (retrieval) => {
                  const updated = await api.upsertRetrieval(cycle.id, retrieval);
                  setCycle(updated);
                }}
              />
            </div>
          )}

          {!isTransferOnly && hasInjections && cycle.retrieval && cycle.retrieval.totalEggs > 0 && (
            <div ref={fertilizationRef}>
              <FertilizationSection
                fertilization={cycle.fertilization}
                retrievalDate={cycle.retrieval?.retrievalDate}
                retrievalCount={cycle.retrieval?.totalEggs}
                onUpdate={async (fertilization) => {
                  const updated = await api.upsertFertilization(cycle.id, fertilization);
                  setCycle(updated);
                }}
              />
            </div>
          )}

          {!isTransferOnly && cycle.fertilization && cycle.fertilization.totalFertilized > 0 && (
            <div ref={cultureRef}>
              <EmbryoCultureSection
                culture={cultureData}
                fertilizedCount={cycle.fertilization?.totalFertilized}
                showPlanModal={showPlanModal}
                onClosePlanModal={() => setShowPlanModal(false)}
                onUpdate={async (culture) => {
                  const updated = await api.upsertCulture(cycle.id, culture);
                  setCycle(updated);
                }}
              />
            </div>
          )}

          {!isTransferOnly && cultureData && cultureData.totalEmbryos > 0 && (!cultureData.nextPlans || cultureData.nextPlans.length === 0) && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <button
                onClick={() => setShowPlanModal(true)}
                className="w-full text-center text-sm text-gray-700 underline active:text-gray-900"
              >
                다음단계 기록하기
              </button>
            </div>
          )}

          {!isTransferOnly && cultureData?.nextPlans?.includes('transfer') && cultureData.totalEmbryos > 0 && (
            <TransferSection
              transfer={cycle.transfer}
              embryoCount={cultureData?.totalEmbryos}
              onUpdate={async (transfer) => {
                const updated = await api.upsertTransfer(cycle.id, transfer);
                setCycle(updated);
              }}
            />
          )}

          {!isTransferOnly && cultureData?.nextPlans?.includes('pgt') && cultureData.totalEmbryos > 0 && (
            <div ref={pgtRef}>
              <PGTSection
                pgt={cycle.pgt}
                embryoCount={cultureData?.totalEmbryos}
                onUpdate={async (pgt) => {
                  const updated = await api.upsertPGT(cycle.id, pgt);
                  setCycle(updated);
                }}
              />
            </div>
          )}

          {!isTransferOnly && cultureData?.nextPlans?.includes('freeze') && cultureData.totalEmbryos > 0 && (
            <FreezeSection
              freeze={cycle.freeze}
              embryoCount={cultureData?.totalEmbryos}
              onUpdate={async (freeze) => {
                const updated = await api.upsertFreeze(cycle.id, freeze);
                setCycle(updated);
              }}
            />
          )}

          {/* 하단 멀티플렉스 광고 */}
          {/* <MockMultiplexAd /> */}
        </div>
      </div>
      <BottomNav />

      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">사이클 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">회차 *</label>
                <input
                  type="number"
                  min="1"
                  value={editCycleNumber}
                  onChange={(e) => setEditCycleNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모 (선택)</label>
                {editTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 text-sm rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setEditTags(editTags.filter((_, idx) => idx !== i))}
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
                    value={editTagInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(' ')) {
                        const word = val.replace(/\s/g, '').replace(/^#/, '');
                        if (word && !editTags.includes(word)) {
                          setEditTags([...editTags, word]);
                        }
                        setEditTagInput('');
                      } else {
                        setEditTagInput(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editTagInput.trim()) {
                        e.preventDefault();
                        const word = editTagInput.trim().replace(/^#/, '');
                        if (word && !editTags.includes(word)) {
                          setEditTags([...editTags, word]);
                        }
                        setEditTagInput('');
                      }
                      if (e.key === 'Backspace' && !editTagInput && editTags.length > 0) {
                        setEditTags(editTags.slice(0, -1));
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="병원명, 프로토콜 등"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleEditCycle}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
