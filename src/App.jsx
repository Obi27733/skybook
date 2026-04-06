import React from 'react'
import useStore from './store/useStore'
import FileUploader from './components/FileUploader'
import LoginPage from './components/LoginPage'
import FlightDashboard from './components/FlightDashboard'
import SeatMap from './components/SeatMap'
import PaymentPage from './components/PaymentPage'
import BoardingPass from './components/BoardingPass'
import { FiArrowLeft, FiRefreshCw, FiLogOut, FiUser } from 'react-icons/fi'

const STEP_LABELS = {
  upload: 'Data Import',
  login: 'Authentication',
  dashboard: 'Flight Selection',
  seatmap: 'Seat Selection',
  payment: 'Secure Payment',
  boarding: 'Booking Confirmed'
}

export default function App() {
  const step = useStore((s) => s.step)
  const user = useStore((s) => s.user)
  const goBack = useStore((s) => s.goBack)
  const resetAll = useStore((s) => s.resetAll)
  const logout = useStore((s) => s.logout)

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">S</div>
          <div>
            <div className="navbar-title">SkyBook</div>
            <div className="navbar-subtitle">Flight Reservation System</div>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="navbar-step">
            <span className="step-dot"></span>
            {STEP_LABELS[step]}
          </div>

          {user && (
            <div className="navbar-user">
              <FiUser size={14} />
              <span>{user.name}</span>
            </div>
          )}

          {step !== 'upload' && (
            <button className="btn btn-ghost btn-sm" onClick={goBack}>
              <FiArrowLeft /> Back
            </button>
          )}

          {step !== 'upload' && step !== 'login' && (
            <button className="btn btn-ghost btn-sm" onClick={resetAll} title="Start Over">
              <FiRefreshCw />
            </button>
          )}

          {user && (
            <button className="btn btn-ghost btn-sm" onClick={logout} title="Sign Out">
              <FiLogOut />
            </button>
          )}
        </div>
      </nav>

      <main>
        {step === 'upload' && <FileUploader />}
        {step === 'login' && <LoginPage />}
        {step === 'dashboard' && <FlightDashboard />}
        {step === 'seatmap' && <SeatMap />}
        {step === 'payment' && <PaymentPage />}
        {step === 'boarding' && <BoardingPass />}
      </main>
    </div>
  )
}
