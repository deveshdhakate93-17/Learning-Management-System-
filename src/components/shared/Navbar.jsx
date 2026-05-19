import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, LogOut, User, ChevronDown, BookOpen, HelpCircle, MessageSquare, FileText, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import LMSLogo from './LMSLogo';
import SignOutModal from '../auth/SignOutModal';
import { logoutUser } from '../../store/authSlice';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("You've been signed out.");
      navigate('/login');
    } catch {
      toast.error('Sign out failed. Please try again.');
    }
    setSignOutOpen(false);
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-[12px] shadow-sm'
            : 'bg-white/60 backdrop-blur-[8px]'
        }`}
        style={{ height: '75px', borderBottom: '1px solid rgba(229,231,235,0.6)' }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <LMSLogo size={44} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-heading font-extrabold text-primary text-base leading-tight">LMS</span>
              <span className="font-body text-text-secondary text-[11px] leading-tight">Learning Management System</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-primary bg-bg-secondary' : 'text-text-secondary hover:text-primary hover:bg-bg-secondary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right: Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-btn hover:bg-bg-secondary transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-text-primary font-medium text-sm">{user?.fullName?.split(' ')[0] || 'User'}</span>
                  <ChevronDown size={14} className={`text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-card border border-border shadow-hover overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-heading font-semibold text-text-primary text-sm">{user?.fullName}</p>
                        <p className="text-text-muted text-xs">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { setSignOutOpen(true); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-error text-sm hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
                <LogIn size={16} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-btn text-text-secondary hover:bg-bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden bg-white/95 backdrop-blur-[12px] border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-all ${
                        isActive ? 'bg-bg-secondary text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-primary'
                      }`
                    }
                  >
                    <Icon size={17} /> {label}
                  </NavLink>
                ))}
                <div className="pt-3 border-t border-border mt-2">
                  {isAuthenticated ? (
                    <button
                      onClick={() => { setSignOutOpen(true); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-btn text-error text-sm hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={17} /> Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <LogIn size={16} /> Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Sign out modal */}
      <SignOutModal
        isOpen={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
};

export default Navbar;
