import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { AuthUser } from '../types/scholarship';
import { BrandLogo } from './StatusIndicator';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onGoRegister: () => void;
  onBackHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoRegister,
  onBackHome,
}) => {
  const [email, setEmail] = useState('aarav.sharma@student.edu.in');
  const [password, setPassword] = useState('student123');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email address and password.');
      return;
    }
    const isAdmin = email.toLowerCase().includes('admin');
    onLoginSuccess({
      id: isAdmin ? 'admin-1' : 'student-1',
      name: isAdmin ? 'Scholarship Administrator' : email.split('@')[0].replace('.', ' '),
      email: email.trim(),
      role: isAdmin ? 'admin' : 'student',
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between p-6">
      <div className="max-w-[1100px] w-full mx-auto flex items-center justify-between">
        <BrandLogo onClick={onBackHome} />
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F1E46] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-10 bg-white border border-slate-200 rounded-xl p-8">
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
          {forgotMode ? 'Reset Your Password' : 'Sign in to ScholarKnowledge'}
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          {forgotMode
            ? 'Enter your registered email to receive a prototype password reset confirmation.'
            : 'Access your student eligibility dashboard or scholarship administration console.'}
        </p>

        {forgotMode ? (
          <div className="mt-6 space-y-4">
            {resetSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  Prototype reset instructions queued for <strong>{email || 'your email'}</strong>. You can sign in directly using your demo credentials.
                </span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSent(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu.in"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer"
                >
                  Send Reset Instructions
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setResetSent(false);
              }}
              className="text-sm font-medium text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu.in"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="font-medium text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors cursor-pointer"
            >
              Login
            </button>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <p className="text-xs text-slate-500 text-center">
                Quick Prototype Access (For Project Demo)
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    onLoginSuccess({
                      id: 'student-1',
                      name: 'Aarav Sharma',
                      email: 'aarav.sharma@student.edu.in',
                      role: 'student',
                    })
                  }
                  className="py-2 px-3 text-xs font-semibold text-[#1D4ED8] bg-[#1D4ED8]/8 hover:bg-[#1D4ED8]/15 rounded-lg transition-colors cursor-pointer"
                >
                  Demo Student
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLoginSuccess({
                      id: 'admin-1',
                      name: 'Dr. Kavita Rao (Admin)',
                      email: 'admin@scholarknowledge.edu.in',
                      role: 'admin',
                    })
                  }
                  className="py-2 px-3 text-xs font-semibold text-[#0F1E46] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Demo Admin
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-600 pt-2">
              New student on ScholarKnowledge AI?{' '}
              <button
                type="button"
                onClick={onGoRegister}
                className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        Prototype authentication for academic demonstration · No sensitive documents stored
      </p>
    </div>
  );
};

interface RegisterPageProps {
  onRegisterSuccess: (user: AuthUser) => void;
  onGoLogin: () => void;
  onBackHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onGoLogin,
  onBackHome,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim()) {
      setError('Full name and email address are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    onRegisterSuccess({
      id: `student-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      role: 'student',
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between p-6">
      <div className="max-w-[1100px] w-full mx-auto flex items-center justify-between">
        <BrandLogo onClick={onBackHome} />
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F1E46] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-8 bg-white border border-slate-200 rounded-xl p-8">
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
          Create Your Student Account
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          Set up your profile to check scholarship eligibility and save opportunities.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Deshmukh"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@college.edu.in"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
          >
            Create Account
          </button>

          <p className="text-center text-xs text-slate-600 pt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoLogin}
              className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Login here
            </button>
          </p>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500">
        Your profile is used solely for deterministic scholarship rule matching.
      </p>
    </div>
  );
};
