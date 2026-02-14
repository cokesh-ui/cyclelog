import { Cycle } from '../types';
import { motion } from 'motion/react';
import { useRef, useEffect } from 'react';

interface CycleProgressProps {
  cycle: Cycle;
  compact?: boolean; // CycleList에서 사용할 때는 compact 모드
  onStepClick?: (step: string) => void;
}

export function CycleProgress({ cycle, compact = false, onStepClick }: CycleProgressProps) {
  // culture 데이터 가져오기 (호환성)
  const cultureData = cycle.culture || cycle.day5 || cycle.day3;
  
  // 스크롤 컨테이너 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 컴포넌트 마운트 시 오른쪽 끝으로 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [cycle]); // cycle이 변경될 때마다 실행

  const handleStepClick = (step: string) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  const renderStep = (
    isCompleted: boolean,
    label: string,
    value?: number | string,
    color?: string,
    stepKey?: string,
    shouldShow: boolean = true
  ) => {
    if (!shouldShow) return null;

    const colorClasses = color || 'from-pink-500 to-purple-500';
    const size = compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg';
    const minWidth = compact ? 'min-w-[50px]' : 'min-w-[60px]';
    const fontSize = compact ? 'text-[10px]' : 'text-xs';
    
    if (isCompleted) {
      return (
        <div className={`flex flex-col items-center gap-2 ${minWidth} group relative`}>
          <button
            onClick={() => stepKey && handleStepClick(stepKey)}
            className={`${size} rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${colorClasses} ${
              onStepClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
            } relative z-10`}
          >
            {value ?? '✓'}
          </button>
          <span className={`${fontSize} text-gray-700 font-medium whitespace-nowrap`}>
            {label}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center gap-2 ${minWidth}`}>
        <button
          onClick={() => stepKey && handleStepClick(stepKey)}
          className={`${size} rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gray-300 ${
            onStepClick ? 'cursor-pointer active:bg-gray-400 active:scale-95 transition-all' : ''
          } relative z-10`}
        >
          −
        </button>
        <span className={`${fontSize} text-gray-500 font-medium whitespace-nowrap`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* 연결선 배경 */}
      {!compact && (
        <div className="absolute top-8 left-[35px] right-0 h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200"></div>
      )}
      {compact && (
        <div className="absolute top-6 left-[28px] right-0 h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200"></div>
      )}
      
      <div className={`relative flex items-start ${compact ? 'gap-2' : 'gap-2.5'} overflow-x-auto pb-2 pt-2 px-1`} ref={scrollContainerRef}>
        {/* 과배란 (주사 기록) */}
        {renderStep(
          cycle.injections.length > 0,
          '과배란',
          undefined,
          undefined,
          'injection',
          true
        )}

        {/* 채취 */}
        {renderStep(
          !!cycle.retrieval,
          '채취',
          cycle.retrieval?.totalEggs,
          undefined,
          'retrieval',
          cycle.injections.length > 0
        )}

        {/* 수정 */}
        {renderStep(
          !!cycle.fertilization,
          '수정',
          cycle.fertilization?.totalFertilized,
          undefined,
          'fertilization',
          !!cycle.retrieval
        )}

        {/* 배양 */}
        {renderStep(
          !!cultureData,
          cultureData?.day ? `${cultureData.day}일` : '배양',
          cultureData?.totalEmbryos,
          undefined,
          'culture',
          !!cycle.fertilization
        )}

        {/* 배양 이후 입력된 것들 */}
        {cultureData && (
          <>
            {/* 이식 */}
            {cycle.transfer && cycle.transfer.transferCount > 0 && (
              <div className={`flex flex-col items-center gap-2 ${compact ? 'min-w-[50px]' : 'min-w-[60px]'} group relative`}>
                <button
                  onClick={() => handleStepClick('culture')}
                  className={`${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'} rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 ${
                    onStepClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
                  } relative z-10`}
                >
                  {cycle.transfer.transferCount}
                </button>
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 font-medium whitespace-nowrap`}>
                  이식
                </span>
              </div>
            )}

            {/* 동결 */}
            {cycle.freeze && cycle.freeze.frozenCount > 0 && (
              <div className={`flex flex-col items-center gap-2 ${compact ? 'min-w-[50px]' : 'min-w-[60px]'} group relative`}>
                <button
                  onClick={() => handleStepClick('culture')}
                  className={`${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'} rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 ${
                    onStepClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
                  } relative z-10`}
                >
                  {cycle.freeze.frozenCount}
                </button>
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 font-medium whitespace-nowrap`}>
                  동결
                </span>
              </div>
            )}

            {/* PGT 통과 */}
            {cycle.pgt && (
              <>
                {/* 정배수 (Euploid) - 축하 효과 */}
                {cycle.pgt.euploid > 0 && (
                  <div className={`flex flex-col items-center gap-2 ${compact ? 'min-w-[50px]' : 'min-w-[60px]'} group relative`}>
                    {/* 반짝이는 배경 효과 */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-green-300 blur-sm`}></div>
                    </motion.div>

                    {/* 메인 버튼 */}
                    <motion.button
                      onClick={() => handleStepClick('pgt')}
                      className={`${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'} rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 ${
                        onStepClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
                      } relative z-10`}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 4px 6px rgba(34, 197, 94, 0.3)',
                          '0 8px 16px rgba(34, 197, 94, 0.5)',
                          '0 4px 6px rgba(34, 197, 94, 0.3)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {cycle.pgt.euploid}
                    </motion.button>
                    <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 font-medium whitespace-nowrap`}>
                      정배수
                    </span>
                  </div>
                )}

                {/* 모자이크 (Mosaic) */}
                {cycle.pgt.mosaic !== undefined && cycle.pgt.mosaic > 0 && (
                  <div className={`flex flex-col items-center gap-2 ${compact ? 'min-w-[50px]' : 'min-w-[60px]'} group relative`}>
                    <button
                      onClick={() => handleStepClick('pgt')}
                      className={`${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'} rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br from-yellow-400 to-amber-500 ${
                        onStepClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
                      } relative z-10`}
                    >
                      {cycle.pgt.mosaic}
                    </button>
                    <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 font-medium whitespace-nowrap`}>
                      모자이크
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}