import React, { useMemo, useCallback } from 'react'
import { jsPDF } from 'jspdf'
import useStore from '../store/useStore'
import { FiDownload, FiRefreshCw, FiCheckCircle, FiNavigation } from 'react-icons/fi'

function generateBarcodeBars() {
  const bars = []
  for (let i = 0; i < 65; i++) {
    bars.push({ height: 18 + Math.random() * 28, width: Math.random() > 0.5 ? 3 : 2 })
  }
  return bars
}

export default function BoardingPass() {
  const activeFlight = useStore((s) => s.activeFlight)
  const selectedSeat = useStore((s) => s.selectedSeat)
  const passengerName = useStore((s) => s.passengerName)
  const user = useStore((s) => s.user)
  const resetAll = useStore((s) => s.resetAll)

  const barcodeBars = useMemo(() => generateBarcodeBars(), [])

  const bookingRef = useMemo(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let ref = 'SB-'
    for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)]
    return ref
  }, [])

  const gate = useMemo(() => `${String.fromCharCode(65 + Math.floor(Math.random() * 8))}${Math.floor(Math.random() * 30) + 1}`, [])

  const boardingTime = useMemo(() => {
    if (!activeFlight?.departure) return '--:--'
    const [h, m] = activeFlight.departure.split(':').map(Number)
    const totalMin = h * 60 + m - 30
    const bh = Math.floor((totalMin + 1440) % 1440 / 60)
    const bm = (totalMin + 1440) % 1440 % 60
    return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`
  }, [activeFlight])

  const downloadPDF = useCallback(() => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [220, 110] })

      // Background
      doc.setFillColor(10, 18, 32)
      doc.rect(0, 0, 220, 110, 'F')

      // Top accent bar
      doc.setFillColor(0, 232, 162)
      doc.rect(0, 0, 220, 3, 'F')

      // Logo box
      doc.setFillColor(0, 232, 162)
      doc.roundedRect(12, 10, 11, 11, 2, 2, 'F')
      doc.setTextColor(10, 18, 32)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('S', 17.5, 17, { align: 'center' })

      // Airline name
      doc.setTextColor(240, 244, 248)
      doc.setFontSize(15)
      doc.setFont('helvetica', 'bold')
      doc.text('SkyBook Air', 28, 17)

      // Flight ID
      doc.setTextColor(0, 232, 162)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(activeFlight?.flightId || 'SK000', 205, 17, { align: 'right' })

      // Header underline
      doc.setDrawColor(40, 55, 80)
      doc.setLineWidth(0.3)
      doc.line(12, 25, 208, 25)

      // Origin
      doc.setTextColor(240, 244, 248)
      doc.setFontSize(32)
      doc.setFont('helvetica', 'bold')
      doc.text(activeFlight?.origin || '---', 20, 44)

      // Destination
      doc.text(activeFlight?.destination || '---', 200, 44, { align: 'right' })

      // Arrow line between cities
      doc.setDrawColor(0, 232, 162)
      doc.setLineWidth(0.8)
      doc.line(65, 40, 148, 40)

      // Arrow head using triangle (confirmed working)
      doc.setFillColor(0, 232, 162)
      doc.triangle(148, 37, 148, 43, 154, 40, 'F')

      // Departure/Arrival times
      doc.setTextColor(100, 120, 148)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(activeFlight?.departure || '--:--', 20, 51)
      doc.text(activeFlight?.arrival || '--:--', 200, 51, { align: 'right' })

      // Separator line (solid, not dashed - dashed can be unreliable)
      doc.setDrawColor(40, 55, 80)
      doc.setLineWidth(0.2)
      doc.line(12, 57, 208, 57)

      // Details - Row 1
      const row1 = [
        { label: 'PASSENGER', value: (passengerName || 'Guest').toUpperCase(), color: null },
        { label: 'SEAT', value: selectedSeat?.id || '--', color: null },
        { label: 'CLASS', value: selectedSeat?.seatClass === 'business' ? 'BUSINESS' : 'ECONOMY', color: null },
        { label: 'GATE', value: gate, color: null }
      ]

      const row2 = [
        { label: 'BOARDING', value: boardingTime, color: null },
        { label: 'DATE', value: activeFlight?.date || '--', color: null },
        { label: 'BOOKING REF', value: bookingRef, color: [0, 232, 162] },
        { label: 'PRICE', value: 'INR ' + (selectedSeat?.price?.toLocaleString() || '0'), color: [245, 158, 11] }
      ]

      const colW = 48
      const startX = 16

      const renderRow = (items, labelY, valueY) => {
        items.forEach((item, i) => {
          const x = startX + i * colW
          doc.setTextColor(80, 100, 130)
          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          doc.text(item.label, x, labelY)
          if (item.color) {
            doc.setTextColor(item.color[0], item.color[1], item.color[2])
          } else {
            doc.setTextColor(240, 244, 248)
          }
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(String(item.value), x, valueY)
        })
      }

      renderRow(row1, 64, 71)
      renderRow(row2, 80, 87)

      // Barcode separator
      doc.setDrawColor(40, 55, 80)
      doc.setLineWidth(0.2)
      doc.line(12, 93, 208, 93)

      // Barcode bars
      let bx = 30
      barcodeBars.forEach((bar) => {
        const h = bar.height * 0.28
        doc.setFillColor(140, 160, 185)
        doc.rect(bx, 100 - h / 2, bar.width * 0.55, h, 'F')
        bx += bar.width * 0.55 + 0.8
      })

      doc.save(`SkyBook_${activeFlight?.flightId || 'ticket'}_${selectedSeat?.id || ''}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF. Please try again.')
    }
  }, [activeFlight, selectedSeat, passengerName, barcodeBars, bookingRef, gate, boardingTime])

  if (!activeFlight || !selectedSeat) return null

  const displayName = passengerName || user?.name || 'Guest'

  return (
    <div className="boarding-container animate-fade-in">
      <div className="boarding-success">
        <div className="boarding-success-icon">
          <FiCheckCircle size={36} />
        </div>
        <h2>Booking Confirmed!</h2>
        <p>Your boarding pass is ready. Download it as a PDF below.</p>
      </div>

      <div className="boarding-pass" id="boarding-pass-display">
        <div className="boarding-pass-header">
          <div className="boarding-pass-airline">
            <div className="boarding-pass-airline-logo">S</div>
            <span className="boarding-pass-airline-name">SkyBook Air</span>
          </div>
          <div className="boarding-pass-flight-id">{activeFlight.flightId}</div>
        </div>

        <div className="boarding-pass-body">
          <div className="boarding-route-point">
            <h3>{activeFlight.origin}</h3>
            <p>{activeFlight.departure}</p>
          </div>
          <div className="boarding-route-center">
            <FiNavigation size={18} />
            <div className="boarding-route-line"></div>
          </div>
          <div className="boarding-route-point" style={{ textAlign: 'right' }}>
            <h3>{activeFlight.destination}</h3>
            <p>{activeFlight.arrival}</p>
          </div>
        </div>

        <div className="boarding-pass-details">
          <div className="boarding-detail">
            <span className="boarding-detail-label">Passenger</span>
            <span className="boarding-detail-value">{displayName}</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Seat</span>
            <span className="boarding-detail-value" style={{ color: 'var(--accent-gold)' }}>{selectedSeat.id}</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Class</span>
            <span className="boarding-detail-value">
              {selectedSeat.seatClass === 'business' ? 'Business' : 'Economy'}
            </span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Gate</span>
            <span className="boarding-detail-value">{gate}</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Boarding</span>
            <span className="boarding-detail-value">{boardingTime}</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Date</span>
            <span className="boarding-detail-value">{activeFlight.date}</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Booking Ref</span>
            <span className="boarding-detail-value" style={{ color: 'var(--accent-cyan)' }}>{bookingRef}</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-detail-label">Amount Paid</span>
            <span className="boarding-detail-value" style={{ color: 'var(--accent-gold)' }}>INR {selectedSeat.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="boarding-pass-barcode">
          {barcodeBars.map((bar, i) => (
            <div key={i} className="barcode-line" style={{ height: `${bar.height}px`, width: `${bar.width}px` }} />
          ))}
        </div>
      </div>

      <div className="boarding-actions">
        <button className="btn btn-primary btn-lg" onClick={downloadPDF} id="download-pdf-btn">
          <FiDownload size={18} /> Download Boarding Pass (PDF)
        </button>
        <button className="btn btn-secondary btn-lg" onClick={resetAll} id="new-booking-btn">
          <FiRefreshCw size={18} /> New Booking
        </button>
      </div>
    </div>
  )
}
