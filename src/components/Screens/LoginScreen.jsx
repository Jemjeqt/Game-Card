import React, { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import { isFirebaseConfigured } from '../../firebase/config';

// ===== LOGIN / REGISTER SCREEN =====
// Gated entry: user must login or register before accessing the game

export default function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState(''); // login: nickname or email
  const [email, setEmail] = useState('');            // register: optional email
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!identifier.trim()) {
        useAuthStore.setState({ error: 'Masukkan nickname atau email.' });
        return;
      }
      await login(identifier.trim(), password);
    } else {
      if (username.trim().length < 3) {
        useAuthStore.setState({ error: 'Nickname minimal 3 karakter.' });
        return;
      }
      if (username.trim().includes(' ')) {
        useAuthStore.setState({ error: 'Nickname tidak boleh mengandung spasi.' });
        return;
      }
      await register(email, password, username.trim());
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-icon">⚠️</div>
          <h2 className="login-title">Firebase Belum Dikonfigurasi</h2>
          <p className="login-subtitle">
            Tambahkan konfigurasi Firebase di file <code>.env</code> untuk mengaktifkan login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Header */}
        <div className="login-icon">⚔️</div>
        <h1 className="login-title">Card Battle</h1>
        <p className="login-subtitle">
          {mode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}
        </p>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="login-field">
              <label className="login-label">👤 Nickname</label>
              <input
                className="login-input"
                type="text"
                placeholder="Nickname unik kamu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                required
                autoComplete="username"
              />
              <span className="login-hint">Dipakai untuk login nanti</span>
            </div>
          )}

          {mode === 'login' ? (
            <div className="login-field">
              <label className="login-label">👤 Nickname / Email</label>
              <input
                className="login-input"
                type="text"
                placeholder="Masukkan nickname atau email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          ) : (
            <div className="login-field">
              <label className="login-label">📧 Email <span className="login-optional">(opsional)</span></label>
              <input
                className="login-input"
                type="email"
                placeholder="Opsional — untuk reset password"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}

          <div className="login-field">
            <label className="login-label">🔒 Password</label>
            <div className="login-password-wrapper">
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="login-show-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={isAuthenticating}
          >
            {isAuthenticating
              ? '⏳ Loading...'
              : mode === 'login'
              ? '🚪 Masuk'
              : '✨ Daftar'}
          </button>
        </form>

        {/* Toggle */}
        <div className="login-toggle">
          {mode === 'login' ? (
            <p>
              Belum punya akun?{' '}
              <button className="login-toggle-btn" onClick={toggleMode}>
                Daftar Sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button className="login-toggle-btn" onClick={toggleMode}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Decorative particles */}
      <div className="login-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`login-particle login-particle--${i}`} />
        ))}
      </div>
    </div>
  );
}
