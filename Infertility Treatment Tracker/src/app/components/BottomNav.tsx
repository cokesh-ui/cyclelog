import { useLocation, Link } from 'react-router';
import { List, Heart } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50 shadow-lg">
      <div className="flex max-w-4xl mx-auto">
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
            isActive('/')
              ? 'text-pink-600 bg-pink-50'
              : 'text-gray-400'
          }`}
        >
          <List className="w-6 h-6" />
          <span className="text-xs font-medium">전체 사이클</span>
        </Link>
        <Link
          to="/current"
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
            isActive('/current')
              ? 'text-pink-600 bg-pink-50'
              : 'text-gray-400'
          }`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs font-medium">진행중</span>
        </Link>
      </div>
    </nav>
  );
}
