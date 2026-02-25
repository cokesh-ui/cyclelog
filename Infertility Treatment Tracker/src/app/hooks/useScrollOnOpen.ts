import { useRef, useEffect } from 'react';

/**
 * 섹션이 열릴 때 화면 가운데로 스크롤하는 훅
 */
export function useScrollOnOpen(isOpen: boolean, isEditing: boolean) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [isOpen, isEditing]);

  return sectionRef;
}
