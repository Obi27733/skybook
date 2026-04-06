import React, { useMemo } from 'react'
import useStore from '../store/useStore'
import { FiInfo, FiCheck, FiNavigation } from 'react-icons/fi'

const SEAT_W = 40
const SEAT_H = 40
const SEAT_GAP = 6
const AISLE_GAP = 30
const ROW_LABEL_W = 40
const HEADER_H = 54
const FUSELAGE_PAD = 18

function getColLetter(colIndex) {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[colIndex] || String(colIndex)
}

function parseSeatLayout(capacityStr) {
  const str = String(capacityStr || '6x30')
  const match = str.match(/(\d+)\s*x\s*(\d+)/i)
  if (match) return { cols: parseInt(match[1]), rows: parseInt(match[2]) }
  const num = parseInt(str)
  return { cols: 6, rows: num ? Math.ceil(num / 6) : 30 }
}

function parseOccupied(occupiedStr) {
  if (!occupiedStr || !occupiedStr.trim()) return new Set()
  return new Set(occupiedStr.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))
}

function calculatePrice(basePrice, row, totalRows, col, totalCols) {
  const base = Number(basePrice) || 3000
  if (row < 5) return Math.round(base * 2.0)
  if (row < 10) return Math.round(base * 1.4)
  if (col === 0 || col === totalCols - 1) return Math.round(base * 1.15)
  return Math.round(base)
}

function getSeatClass(row) {
  return row < 5 ? 'business' : 'economy'
}

export default function SeatMap() {
  const activeFlight = useStore((s) => s.activeFlight)
  const selectedSeat = useStore((s) => s.selectedSeat)
  const setSelectedSeat = useStore((s) => s.setSelectedSeat)
  const passengerName = useStore((s) => s.passengerName)
  const setPassengerName = useStore((s) => s.setPassengerName)
  const passengerEmail = useStore((s) => s.passengerEmail)
  const setPassengerEmail = useStore((s) => s.setPassengerEmail)
  const confirmBooking = useStore((s) => s.confirmBooking)

  const layout = useMemo(() => parseSeatLayout(activeFlight?.capacity), [activeFlight])
  const occupied = useMemo(() => parseOccupied(activeFlight?.occupiedSeats), [activeFlight])

  const seatGrid = useMemo(() => {
    const seats = []
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const letter = getColLetter(c)
        const seatId = `${r + 1}${letter}`
        seats.push({
          id: seatId, row: r, col: c, letter,
          isOccupied: occupied.has(seatId),
          price: calculatePrice(activeFlight?.basePrice, r, layout.rows, c, layout.cols),
          seatClass: getSeatClass(r)
        })
      }
    }
    return seats
  }, [layout, occupied, activeFlight])

  if (!activeFlight) return null

  const halfCols = Math.ceil(layout.cols / 2)
  const seatBlockW = halfCols * (SEAT_W + SEAT_GAP) - SEAT_GAP
  const totalW = ROW_LABEL_W + FUSELAGE_PAD + seatBlockW + AISLE_GAP + seatBlockW + FUSELAGE_PAD + ROW_LABEL_W
  const totalH = HEADER_H + layout.rows * (SEAT_H + SEAT_GAP) + FUSELAGE_PAD * 2

  function getSeatX(col) {
    const half = Math.ceil(layout.cols / 2)
    if (col < half) return ROW_LABEL_W + FUSELAGE_PAD + col * (SEAT_W + SEAT_GAP)
    return ROW_LABEL_W + FUSELAGE_PAD + seatBlockW + AISLE_GAP + (col - half) * (SEAT_W + SEAT_GAP)
  }

  function getSeatY(row) {
    return HEADER_H + FUSELAGE_PAD + row * (SEAT_H + SEAT_GAP)
  }

  function handleSeatClick(seat) {
    if (seat.isOccupied) return
    setSelectedSeat(selectedSeat?.id === seat.id ? null : seat)
  }

  const occupiedCount = occupied.size
  const totalSeats = layout.cols * layout.rows

  return (
    <div className="seatmap-container animate-fade-in">
      <div className="seatmap-sidebar">
        <div className="glass-card seatmap-info-card">
          <h3><FiInfo size={18} /> Flight Details</h3>
          <div className="info-row"><span className="info-label">Flight</span><span className="info-value">{activeFlight.flightId}</span></div>
          <div className="info-row"><span className="info-label">Route</span><span className="info-value">{activeFlight.origin} &rarr; {activeFlight.destination}</span></div>
          <div className="info-row"><span className="info-label">Aircraft</span><span className="info-value">{activeFlight.aircraft}</span></div>
          <div className="info-row"><span className="info-label">Date</span><span className="info-value">{activeFlight.date}</span></div>
          <div className="info-row"><span className="info-label">Layout</span><span className="info-value">{layout.cols} x {layout.rows}</span></div>
          <div className="info-row"><span className="info-label">Available</span><span className="info-value" style={{ color: 'var(--accent-cyan)' }}>{totalSeats - occupiedCount} / {totalSeats}</span></div>
          <div className="info-row"><span className="info-label">Base Price</span><span className="info-value" style={{ color: 'var(--accent-gold)' }}>INR {Number(activeFlight.basePrice).toLocaleString()}</span></div>
        </div>

        <div className="glass-card seatmap-info-card">
          <h3>Legend</h3>
          <div className="legend">
            <div className="legend-item"><span className="legend-box available"></span>Available</div>
            <div className="legend-item"><span className="legend-box occupied"></span>Occupied</div>
            <div className="legend-item"><span className="legend-box selected"></span>Your Selection</div>
            <div className="legend-item"><span className="legend-box business"></span>Business Class (Rows 1-5)</div>
          </div>
        </div>

        {selectedSeat ? (
          <div className="glass-card selected-seat-card animate-fade-in">
            <h3 style={{ marginBottom: '8px' }}>Your Seat</h3>
            <div className="seat-price-display">INR {selectedSeat.price.toLocaleString()} <span>/seat</span></div>
            <div style={{ marginBottom: '12px' }}>
              <span className={`seat-class-badge ${selectedSeat.seatClass}`}>
                {selectedSeat.seatClass === 'business' ? 'Business Class' : 'Economy Class'}
              </span>
            </div>
            <div className="info-row"><span className="info-label">Seat</span><span className="info-value" style={{ fontSize: '20px' }}>{selectedSeat.id}</span></div>
            <div className="info-row"><span className="info-label">Row</span><span className="info-value">{selectedSeat.row + 1}</span></div>
            <div className="passenger-form">
              <div>
                <label className="form-label">Passenger Name *</label>
                <input className="input" placeholder="Enter full name" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} id="passenger-name" />
              </div>
              <div>
                <label className="form-label">Email (optional)</label>
                <input className="input" placeholder="email@example.com" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} id="passenger-email" />
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => { if (passengerName.trim()) confirmBooking() }}
                disabled={!passengerName.trim()}
                id="confirm-booking-btn"
                style={{ marginTop: '8px', width: '100%' }}
              >
                <FiCheck size={18} /> Confirm Booking
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card seatmap-info-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px 28px' }}>
            <FiNavigation size={28} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px' }}>Click an available seat to select it</p>
          </div>
        )}
      </div>

      <div className="seatmap-main">
        <div className="seatmap-plane-wrapper">
          <svg width={totalW} height={totalH + 60} viewBox={`0 0 ${totalW} ${totalH + 60}`} xmlns="http://www.w3.org/2000/svg">
            <rect x={ROW_LABEL_W} y={0} width={totalW - ROW_LABEL_W * 2} height={totalH + 40} rx={FUSELAGE_PAD} fill="rgba(22, 32, 56, 0.4)" stroke="rgba(136, 153, 176, 0.08)" strokeWidth={1} />

            {Array.from({ length: layout.cols }).map((_, c) => (
              <text key={`col-${c}`} x={getSeatX(c) + SEAT_W / 2} y={HEADER_H - 8} textAnchor="middle" fill="#4b5e78" fontSize="13" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                {getColLetter(c)}
              </text>
            ))}

            {layout.rows > 5 && (
              <>
                <line x1={ROW_LABEL_W + 4} y1={getSeatY(5) - SEAT_GAP / 2} x2={totalW - ROW_LABEL_W - 4} y2={getSeatY(5) - SEAT_GAP / 2} stroke="rgba(139, 92, 246, 0.2)" strokeWidth={1} strokeDasharray="6 4" />
                <text x={totalW / 2} y={getSeatY(5) - SEAT_GAP / 2 - 6} textAnchor="middle" fill="rgba(139, 92, 246, 0.4)" fontSize="9" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.12em">ECONOMY CLASS</text>
              </>
            )}

            {Array.from({ length: layout.rows }).map((_, r) => (
              <text key={`row-${r}`} x={ROW_LABEL_W / 2} y={getSeatY(r) + SEAT_H / 2 + 4} textAnchor="middle" fill="#4b5e78" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="500">{r + 1}</text>
            ))}

            {seatGrid.map((seat) => {
              const x = getSeatX(seat.col)
              const y = getSeatY(seat.row)
              const isSelected = selectedSeat?.id === seat.id

              let fill, stroke, strokeW, textColor, opacity
              if (seat.isOccupied) {
                fill = 'rgba(239, 68, 68, 0.12)'; stroke = 'rgba(239, 68, 68, 0.35)'; strokeW = 1.5; textColor = 'rgba(239, 68, 68, 0.45)'; opacity = 0.45
              } else if (isSelected) {
                fill = 'rgba(245, 158, 11, 0.3)'; stroke = '#f59e0b'; strokeW = 2.5; textColor = '#f59e0b'; opacity = 1
              } else if (seat.seatClass === 'business') {
                fill = 'rgba(139, 92, 246, 0.08)'; stroke = 'rgba(139, 92, 246, 0.3)'; strokeW = 1.5; textColor = 'rgba(139, 92, 246, 0.7)'; opacity = 1
              } else {
                fill = 'rgba(0, 232, 162, 0.06)'; stroke = 'rgba(0, 232, 162, 0.2)'; strokeW = 1.5; textColor = 'rgba(0, 232, 162, 0.6)'; opacity = 1
              }

              return (
                <g key={seat.id} onClick={() => handleSeatClick(seat)} style={{ cursor: seat.isOccupied ? 'not-allowed' : 'pointer', opacity }}>
                  {isSelected && (
                    <rect x={x - 3} y={y - 3} width={SEAT_W + 6} height={SEAT_H + 6} rx={9} fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth={1}>
                      <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <rect x={x} y={y} width={SEAT_W} height={SEAT_H} rx={7} fill={fill} stroke={stroke} strokeWidth={strokeW}>
                    {!seat.isOccupied && !isSelected && (
                      <set attributeName="fill" to={seat.seatClass === 'business' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 232, 162, 0.15)'} begin="mouseover" end="mouseout" />
                    )}
                  </rect>
                  <text x={x + SEAT_W / 2} y={y + SEAT_H / 2 + 4} textAnchor="middle" fill={textColor} fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                    {seat.isOccupied ? 'X' : seat.letter}
                  </text>
                  {!seat.isOccupied && <title>Seat {seat.id} - INR {seat.price.toLocaleString()} ({seat.seatClass})</title>}
                </g>
              )
            })}

            <text x={totalW / 2} y={20} textAnchor="middle" fill="#4b5e78" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.18em">COCKPIT</text>
            <text x={totalW / 2} y={totalH + 34} textAnchor="middle" fill="#4b5e78" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.18em">REAR EXIT</text>
          </svg>
        </div>
      </div>
    </div>
  )
}
