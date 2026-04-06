import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import { FiCreditCard, FiLock, FiCheck, FiShield } from 'react-icons/fi'

export default function PaymentPage() {
  const activeFlight = useStore((s) => s.activeFlight)
  const selectedSeat = useStore((s) => s.selectedSeat)
  const passengerName = useStore((s) => s.passengerName)
  const completePayment = useStore((s) => s.completePayment)

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState(passengerName || '')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const taxes = useMemo(() => Math.round((selectedSeat?.price || 0) * 0.18), [selectedSeat])
  const convFee = 199
  const totalAmount = useMemo(() => (selectedSeat?.price || 0) + taxes + convFee, [selectedSeat, taxes])

  function formatCardNumber(val) {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanCard = cardNumber.replace(/\s/g, '')
    if (cleanCard.length < 16) { setError('Please enter a valid 16-digit card number.'); return }
    if (expiry.length < 5) { setError('Please enter a valid expiry date (MM/YY).'); return }
    if (cvv.length < 3) { setError('Please enter a valid CVV.'); return }
    if (!cardName.trim()) { setError('Please enter the cardholder name.'); return }

    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      completePayment({ cardLast4: cleanCard.slice(-4), amount: totalAmount })
    }, 2500)
  }

  if (!activeFlight || !selectedSeat) return null

  return (
    <div className="payment-container animate-fade-in">
      <div className="payment-grid">
        {/* Order Summary */}
        <div className="glass-card payment-summary">
          <h3>Booking Summary</h3>

          <div className="payment-flight-info">
            <div className="payment-route">
              <span className="payment-route-code">{activeFlight.origin}</span>
              <span className="payment-route-arrow">→</span>
              <span className="payment-route-code">{activeFlight.destination}</span>
            </div>
            <div className="payment-flight-meta">
              <span>{activeFlight.flightId}</span>
              <span>{activeFlight.date}</span>
              <span>{activeFlight.departure} - {activeFlight.arrival}</span>
            </div>
          </div>

          <div className="payment-details">
            <div className="payment-detail-row">
              <span>Passenger</span>
              <span className="payment-detail-value">{passengerName}</span>
            </div>
            <div className="payment-detail-row">
              <span>Seat</span>
              <span className="payment-detail-value" style={{ color: 'var(--accent-gold)' }}>{selectedSeat.id}</span>
            </div>
            <div className="payment-detail-row">
              <span>Class</span>
              <span className="payment-detail-value">{selectedSeat.seatClass === 'business' ? 'Business' : 'Economy'}</span>
            </div>
            <div className="payment-detail-row">
              <span>Aircraft</span>
              <span className="payment-detail-value">{activeFlight.aircraft}</span>
            </div>
          </div>

          <div className="payment-pricing">
            <div className="payment-price-row">
              <span>Base Fare</span>
              <span>INR {selectedSeat.price.toLocaleString()}</span>
            </div>
            <div className="payment-price-row">
              <span>Taxes & Fees (18% GST)</span>
              <span>INR {taxes.toLocaleString()}</span>
            </div>
            <div className="payment-price-row">
              <span>Convenience Fee</span>
              <span>INR {convFee}</span>
            </div>
            <div className="payment-price-total">
              <span>Total Amount</span>
              <span>INR {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="payment-secure-badge">
            <FiShield size={14} />
            <span>256-bit SSL Encrypted Payment</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="glass-card payment-form-card">
          <h3><FiCreditCard size={20} /> Payment Details</h3>
          <p className="payment-form-sub">Enter your card information to complete booking</p>

          {processing && (
            <div className="payment-processing-overlay">
              <div className="payment-spinner"></div>
              <h4>Processing Payment...</h4>
              <p>Please do not close this window</p>
            </div>
          )}

          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="payment-field">
              <label className="form-label">Card Number</label>
              <div className="login-input-wrapper">
                <FiCreditCard className="login-input-icon" />
                <input
                  className="input login-input"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setError('') }}
                  maxLength={19}
                  id="card-number"
                  disabled={processing}
                />
              </div>
              <div className="card-brands">
                <span className="card-brand">VISA</span>
                <span className="card-brand">MC</span>
                <span className="card-brand">AMEX</span>
                <span className="card-brand">RuPay</span>
              </div>
            </div>

            <div className="payment-field-row">
              <div className="payment-field" style={{ flex: 1 }}>
                <label className="form-label">Expiry Date</label>
                <input
                  className="input"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setError('') }}
                  maxLength={5}
                  id="card-expiry"
                  disabled={processing}
                />
              </div>
              <div className="payment-field" style={{ flex: 1 }}>
                <label className="form-label">CVV</label>
                <div className="login-input-wrapper">
                  <FiLock className="login-input-icon" />
                  <input
                    className="input login-input"
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                    maxLength={4}
                    id="card-cvv"
                    disabled={processing}
                  />
                </div>
              </div>
            </div>

            <div className="payment-field">
              <label className="form-label">Cardholder Name</label>
              <input
                className="input"
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => { setCardName(e.target.value); setError('') }}
                id="card-name"
                disabled={processing}
              />
            </div>

            {error && <div className="login-error animate-fade-in">{error}</div>}

            <button
              className="btn btn-primary btn-lg payment-submit"
              type="submit"
              disabled={processing}
              id="pay-now-btn"
            >
              {processing ? (
                'Processing...'
              ) : (
                <><FiCheck size={18} /> Pay INR {totalAmount.toLocaleString()}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
