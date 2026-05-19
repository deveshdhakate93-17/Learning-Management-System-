import { Link } from 'react-router-dom';
import LMSLogo from './LMSLogo';

// Custom SVG icons for social brands (not in lucide-react)
const LinkedinIcon = ({ size = 17, color = '#0077B5' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const GithubIcon = ({ size = 17, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);
const InstagramIcon = ({ size = 17, color = '#E1306C' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
);
const YoutubeIcon = ({ size = 17, color = '#FF0000' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

const quickLinks = [
  { path: '/', label: 'Home' },
  { path: '/courses', label: 'Courses' },
  { path: '/quizzes', label: 'Quizzes' },
  { path: '/notes', label: 'Notes' },
  { path: '/chat', label: 'AI Chat' },
];

const socials = [
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn', color: '#0077B5' },
  { icon: GithubIcon, href: '#', label: 'GitHub', color: '#ffffff' },
  { icon: InstagramIcon, href: '#', label: 'Instagram', color: '#E1306C' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube', color: '#FF0000' },
];

const Footer = () => (
  <footer style={{ background: '#0F1117', borderTop: '1px solid rgba(79,70,229,0.2)' }}>
    {/* Top glow border */}
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #4F46E5, #6366F1, transparent)' }} />

    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <LMSLogo size={44} />
            <div>
              <p className="font-heading font-extrabold text-white text-base">LMS</p>
              <p className="text-gray-400 text-xs">Learning Management System</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Master DSA, Web Development & AI with industry-level projects and real-world learning. Join thousands of developers leveling up their careers.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-white text-base mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {quickLinks.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className="text-gray-400 text-sm hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-heading font-bold text-white text-base mb-4">Follow Us</h4>
          <div className="flex gap-3 flex-wrap">
            {socials.map(({ icon: Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-10 h-10 rounded-btn flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-glow"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <Icon size={17} color={color} />
              </a>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-card" style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)' }}>
            <p className="text-white text-sm font-semibold mb-1">🚀 Ready to learn?</p>
            <p className="text-gray-400 text-xs">Join 10,000+ students already enrolled.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">© 2025 LMS Learning Management System. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
