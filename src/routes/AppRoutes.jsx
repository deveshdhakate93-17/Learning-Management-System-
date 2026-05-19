import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import CoursesPage from '../pages/CoursesPage';
import WatchPage from '../pages/WatchPage';
import QuizzesPage from '../pages/QuizzesPage';
import NotesPage from '../pages/NotesPage';
import ChatPage from '../pages/ChatPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage'; // ✅ NEW

const NO_NAVBAR = ['/login', '/register', '/verify-otp', '/forgot-password', '/forgot-password/verify', '/forgot-password/reset', '/oauth/callback'];
const NO_FOOTER = ['/watch', '/chat', '/login', '/register', '/verify-otp', '/forgot-password', '/oauth/callback'];

const AppRoutes = () => {
  const { pathname } = useLocation();
  const showNavbar = !NO_NAVBAR.some(p => pathname.startsWith(p));
  const showFooter = !NO_FOOTER.some(p => pathname.startsWith(p));

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/verify" element={<VerifyOTPPage />} />
        <Route path="/forgot-password/reset" element={<ResetPasswordPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} /> {/* ✅ NEW */}

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/watch/:courseSlug" element={<WatchPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

export default AppRoutes;