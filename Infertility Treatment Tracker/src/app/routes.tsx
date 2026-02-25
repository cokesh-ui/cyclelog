import { createBrowserRouter, Navigate } from 'react-router';
import CycleList from './pages/CycleList';
import CycleDetail from './pages/CycleDetail';
import CurrentCycle from './pages/CurrentCycle';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import ProfileEdit from './pages/ProfileEdit';
import OAuthKakaoCallback from './pages/OAuthKakaoCallback';
import Terms from './pages/Terms';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/oauth/kakao',
    Component: OAuthKakaoCallback,
  },
  {
    path: '/terms',
    element: <ProtectedRoute><Terms /></ProtectedRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><CycleList /></ProtectedRoute>,
  },
  {
    path: '/current',
    element: <ProtectedRoute><CurrentCycle /></ProtectedRoute>,
  },
  {
    path: '/cycle/:id',
    element: <ProtectedRoute><CycleDetail /></ProtectedRoute>,
  },
  {
    path: '/mypage',
    element: <ProtectedRoute><MyPage /></ProtectedRoute>,
  },
  {
    path: '/mypage/edit',
    element: <ProtectedRoute><ProfileEdit /></ProtectedRoute>,
  },
]);
