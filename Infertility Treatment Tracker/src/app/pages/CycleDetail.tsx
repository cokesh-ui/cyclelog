import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Trash2, Edit2, ArrowLeft, MoreVertical } from 'lucide-react';
import { Cycle, EmbryoCultureRecord } from '../types';
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

export default function CycleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // 섹션 ref들
  const injectionRef = useRef<HTMLDivElement>(null);
  const retrievalRef = useRef<HTMLDivElement>(null);
  const fertilizationRef = useRef<HTMLDivElement>(null);
  const cultureRef = useRef<HTMLDivElement>(null);
  const pgtRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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

    if (cycle.injections.length === 0) {
      targetRef = injectionRef;
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

  const handleComplete = () => {
    if (cycle) {
      const confirmComplete = window.confirm('이 사이클을 완료 처리하시겠습니까?');
      if (confirmComplete) {
        setShowMenu(false);
      }
    }
  };

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  const cultureData = cycle.culture;

  const getStartDate = () => {
    if (cycle.injections.length === 0) return cycle.startDate;
    const dates = cycle.injections.map(inj => inj.date);
    return dates.sort()[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
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
                    onClick={handleComplete}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 active:bg-gray-100 transition-colors"
                  >
                    사이클 완료
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

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* 진행 과정 */}
        <div className="mb-6" ref={progressRef}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-gray-700">진행 과정</h3>
            <span className="text-xs text-gray-500">시작일: {getStartDate()}</span>
          </div>
          <CycleProgress
            cycle={cycle}
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

        {/* 섹션들 */}
        <div className="space-y-6">
          <div ref={injectionRef}>
            <InjectionSection
              injections={cycle.injections}
              cycleId={cycle.id}
              onUpdate={(injections) => {
                setCycle({ ...cycle, injections });
              }}
            />
          </div>

          {cycle.injections.length > 0 && (
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

          {cycle.injections.length > 0 && cycle.retrieval && (
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

          {cycle.fertilization && (
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

          {cultureData?.nextPlans?.includes('transfer') && (
            <TransferSection
              transfer={cycle.transfer}
              embryoCount={cultureData?.totalEmbryos}
              onUpdate={async (transfer) => {
                const updated = await api.upsertTransfer(cycle.id, transfer);
                setCycle(updated);
              }}
            />
          )}

          {cultureData?.nextPlans?.includes('freeze') && (
            <FreezeSection
              freeze={cycle.freeze}
              embryoCount={cultureData?.totalEmbryos}
              onUpdate={async (freeze) => {
                const updated = await api.upsertFreeze(cycle.id, freeze);
                setCycle(updated);
              }}
            />
          )}

          {cultureData?.nextPlans?.includes('pgt') && (
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
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
