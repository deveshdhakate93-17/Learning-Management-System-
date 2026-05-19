const PasswordStrengthMeter = ({ password }) => {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '', bg: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#EF4444', bg: 'bg-error' };
    if (score === 2) return { score, label: 'Fair', color: '#F59E0B', bg: 'bg-warning' };
    if (score === 3) return { score, label: 'Good', color: '#3B82F6', bg: 'bg-blue-500' };
    return { score, label: 'Strong', color: '#10B981', bg: 'bg-success' };
  };

  const { score, label, color, bg } = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? bg : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>{label}</p>
    </div>
  );
};

export default PasswordStrengthMeter;
