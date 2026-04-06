import React, { useState } from 'react'
import useStore from '../store/useStore'
import { FiUser, FiLock, FiLogIn, FiMail, FiShield } from 'react-icons/fi'
import { FaGoogle, FaGithub } from 'react-icons/fa'

const USERS = [
  { email: 'admin@skybook.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
  { email: 'john@skybook.com', password: 'john123', name: 'John Doe', role: 'Passenger' },
  { email: 'guest@skybook.com', password: 'guest', name: 'Guest User', role: 'Passenger' }
]

export default function LoginPage() {
  const login = useStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const user = USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      )
      if (user) {
        login({ name: user.name, email: user.email, role: user.role })
      } else {
        setError('Invalid credentials. Please try again.')
      }
      setLoading(false)
    }, 800)
  }

  function handleSocialLogin(provider) {
    setSocialLoading(provider)
    setTimeout(() => {
      const name = provider === 'google' ? 'Google User' : 'GitHub User'
      const emailAddr = provider === 'google' ? 'user@gmail.com' : 'user@github.com'
      login({ name, email: emailAddr, role: 'Passenger', provider })
      setSocialLoading(null)
    }, 1500)
  }

  function handleGuestLogin() {
    setLoading(true)
    setTimeout(() => {
      login({ name: 'Guest User', email: 'guest@skybook.com', role: 'Passenger' })
      setLoading(false)
    }, 500)
  }

  return (
    <div className="login-container">
      <div className="login-card glass-card animate-fade-in">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <FiShield size={28} />
          </div>
          <h2>Sign In to SkyBook</h2>
          <p>Secure authentication required to book flights</p>
        </div>

        {/* Social Login Buttons */}
        <div className="social-login-buttons">
          <button
            className="btn-social btn-google"
            onClick={() => handleSocialLogin('google')}
            disabled={!!socialLoading || loading}
            id="google-login-btn"
          >
            {socialLoading === 'google' ? (
              <span className="social-spinner"></span>
            ) : (
              <FaGoogle size={18} />
            )}
            <span>{socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <button
            className="btn-social btn-github"
            onClick={() => handleSocialLogin('github')}
            disabled={!!socialLoading || loading}
            id="github-login-btn"
          >
            {socialLoading === 'github' ? (
              <span className="social-spinner"></span>
            ) : (
              <FaGithub size={18} />
            )}
            <span>{socialLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
          </button>
        </div>

        <div className="login-divider">
          <span>or sign in with email</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="form-label">Email Address</label>
            <div className="login-input-wrapper">
              <FiMail className="login-input-icon" />
              <input
                className="input login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                id="login-email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="form-label">Password</label>
            <div className="login-input-wrapper">
              <FiLock className="login-input-icon" />
              <input
                className="input login-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                id="login-password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="login-error animate-fade-in">{error}</div>
          )}

          <button
            className="btn btn-primary btn-lg login-submit"
            type="submit"
            disabled={loading || !!socialLoading}
            id="login-submit-btn"
          >
            {loading ? 'Signing in...' : <><FiLogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="login-divider" style={{ marginTop: '16px' }}>
          <span>or</span>
        </div>

        <button
          className="btn btn-secondary login-guest-btn"
          onClick={handleGuestLogin}
          disabled={loading || !!socialLoading}
          id="guest-login-btn"
        >
          <FiUser size={16} /> Continue as Guest
        </button>

        <div className="login-credentials">
          <h4>Test Accounts</h4>
          <div className="login-cred-grid">
            <div className="login-cred-item">
              <span className="login-cred-label">Admin</span>
              <span className="login-cred-value">admin@skybook.com / admin123</span>
            </div>
            <div className="login-cred-item">
              <span className="login-cred-label">User</span>
              <span className="login-cred-value">john@skybook.com / john123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
