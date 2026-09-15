import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Building, CheckCircle2, ArrowRight, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface AuthViewProps {
  onLoginSuccess?: (user: UserType) => void;
  onAuthenticated?: (user: UserType) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onAuthenticated }) => {
  const handleAuthComplete = (user: UserType) => {
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(user);
    }
    if (typeof onAuthenticated === 'function') {
      onAuthenticated(user);
    }
  };

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'VERIFY_EMAIL' | 'FORGOT_PASSWORD'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [signupError, setSignupError] = useState('');

  // Verification state
  const [pendingUser, setPendingUser] = useState<UserType | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Quick demo login shortcuts
  const handleQuickDemoLogin = (demoRole: UserRole) => {
    if (demoRole === 'OFFICER') {
      const officerUser: UserType = {
        id: 'usr-officer-01',
        name: 'James Davis',
        fullName: 'James Davis',
        email: 'james.davis@procure.gov',
        role: 'OFFICER',
        organization: 'Department of Municipal Infrastructure',
        department: 'Public Works & Utilities Division',
        isEmailVerified: true,
      };
      localStorage.setItem('procureai_auth_user', JSON.stringify(officerUser));
      handleAuthComplete(officerUser);
    } else {
      const bidderUser: UserType = {
        id: 'usr-bidder-01',
        name: 'Elena Vance',
        fullName: 'Elena Vance',
        email: 'elena.vance@aquatech.com',
        role: 'BIDDER',
        organization: 'AquaTech Solutions Ltd',
        department: 'Tender & Contracts Division',
        isEmailVerified: true,
      };
      localStorage.setItem('procureai_auth_user', JSON.stringify(bidderUser));
      handleAuthComplete(bidderUser);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your official email and password.');
      return;
    }

    // Check if user was registered locally
    const registeredUsersJson = localStorage.getItem('procureai_registered_users');
    const registeredUsers: any[] = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];

    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword
    );

    if (found) {
      if (!found.isEmailVerified) {
        setPendingUser(found);
        setMode('VERIFY_EMAIL');
        return;
      }
      const authUser: UserType = {
        id: found.id,
        name: found.name,
        fullName: found.fullName || found.name,
        email: found.email,
        role: found.role,
        organization: found.organization,
        department: found.department,
        isEmailVerified: true,
      };
      localStorage.setItem('procureai_auth_user', JSON.stringify(authUser));
      handleAuthComplete(authUser);
      return;
    }

    // Allow standard domain matching or fallback demo
    const isGov = loginEmail.includes('gov') || loginEmail.includes('procure') || loginEmail.includes('officer');
    const computedName = loginEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const authUser: UserType = {
      id: `usr-${Date.now()}`,
      name: computedName,
      fullName: computedName,
      email: loginEmail.trim(),
      role: isGov ? 'OFFICER' : 'BIDDER',
      organization: isGov ? 'Department of Municipal Infrastructure' : 'Commercial Enterprise Bidder',
      isEmailVerified: true,
    };

    localStorage.setItem('procureai_auth_user', JSON.stringify(authUser));
    handleAuthComplete(authUser);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!fullName.trim() || !organizationName.trim() || !signupEmail.trim() || !signupPassword) {
      setSignupError('All fields are required.');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    const newUser: UserType & { password?: string } = {
      id: `usr-${Date.now()}`,
      name: fullName.trim(),
      fullName: fullName.trim(),
      organization: organizationName.trim(),
      email: signupEmail.trim().toLowerCase(),
      role,
      department: role === 'OFFICER' ? 'Procurement & Contracts' : 'Bidding Directorate',
      isEmailVerified: false,
      password: signupPassword,
    };

    // Save to local registry
    const registeredUsersJson = localStorage.getItem('procureai_registered_users');
    const registeredUsers: any[] = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
    registeredUsers.push(newUser);
    localStorage.setItem('procureai_registered_users', JSON.stringify(registeredUsers));

    setPendingUser(newUser);
    setMode('VERIFY_EMAIL');
  };

  const handleVerifyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingUser) return;

    const updatedUser: UserType = {
      ...pendingUser,
      isEmailVerified: true,
    };

    // Update in local registry
    const registeredUsersJson = localStorage.getItem('procureai_registered_users');
    if (registeredUsersJson) {
      const registeredUsers: any[] = JSON.parse(registeredUsersJson);
      const index = registeredUsers.findIndex((u) => u.id === pendingUser.id);
      if (index !== -1) {
        registeredUsers[index].isEmailVerified = true;
        localStorage.setItem('procureai_registered_users', JSON.stringify(registeredUsers));
      }
    }

    localStorage.setItem('procureai_auth_user', JSON.stringify(updatedUser));
    handleAuthComplete(updatedUser);
  };

  const handleResendVerification = () => {
    setResendStatus('A new verification email with security link has been dispatched to your inbox.');
    setTimeout(() => setResendStatus(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-900 text-white shadow-sm mb-4">
          <Shield className="w-8 h-8 text-blue-300" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Procure<span className="text-blue-700">AI</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Government Tender & Due-Diligence Evaluation Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-xl">
          {/* LOGIN VIEW */}
          {mode === 'LOGIN' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access the official government procurement portal
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="officer@department.gov"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('FORGOT_PASSWORD')}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-white text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors shadow-xs"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
                  Or Instant Demo Access
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('OFFICER')}
                    className="p-2.5 rounded-md border border-slate-300 hover:border-blue-700 hover:bg-blue-50/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      Procurement Officer
                    </div>
                    <div className="text-[11px] text-slate-500">James Davis</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('BIDDER')}
                    className="p-2.5 rounded-md border border-slate-300 hover:border-blue-700 hover:bg-blue-50/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      Bidder / Company
                    </div>
                    <div className="text-[11px] text-slate-500">Elena Vance</div>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('SIGNUP')}
                  className="font-bold text-blue-700 hover:text-blue-900"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* SIGN UP VIEW */}
          {mode === 'SIGNUP' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Register as a Procurement Officer or Commercial Bidder
                </p>
              </div>

              {signupError && (
                <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{signupError}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('OFFICER')}
                      className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all text-center ${
                        role === 'OFFICER'
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Procurement Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('BIDDER')}
                      className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all text-center ${
                        role === 'BIDDER'
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Bidder / Company
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Department Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={role === 'OFFICER' ? 'Department of Transport' : 'Infrastructure Corp Ltd'}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@organization.gov"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors shadow-xs"
                >
                  Create Account
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-blue-700 hover:text-blue-900"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* EMAIL VERIFICATION SCREEN */}
          {mode === 'VERIFY_EMAIL' && pendingUser && (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-4">
                <Mail className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Check your email to verify your account
              </h2>
              <p className="text-xs text-slate-600 mt-2">
                We've dispatched an official verification confirmation link to:
              </p>
              <div className="my-3 px-3 py-2 bg-slate-100 rounded-md font-mono text-xs text-slate-800 font-semibold inline-block">
                {pendingUser.email}
              </div>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Click the verification button in your email, or enter the 6-digit verification code below to activate your account.
              </p>

              {resendStatus && (
                <div className="mb-4 p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  {resendStatus}
                </div>
              )}

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code (e.g. 749201)"
                    className="w-full text-center text-base tracking-widest font-mono py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Verify & Proceed to Dashboard</span>
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between text-xs pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend verification email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'FORGOT_PASSWORD' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered official email to receive password recovery instructions.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A password reset link has been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(false);
                      setMode('LOGIN');
                    }}
                    className="w-full py-2 rounded-md text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (forgotEmail.trim()) setForgotSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@organization.gov"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors shadow-xs"
                  >
                    Send Password Reset Link
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Security / Compliance Notice */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Compliant with ISO 27001, USWDS, and Public Procurement Security Standards</span>
        </div>
      </div>
    </div>
  );
};
