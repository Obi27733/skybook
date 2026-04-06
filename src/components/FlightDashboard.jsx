import React, { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import { FiSearch, FiX, FiNavigation } from 'react-icons/fi'

function parseCapacity(cap) {
  if (!cap) return { cols: 6, rows: 30, total: 180 }
  const str = String(cap)
  const match = str.match(/(\d+)\s*x\s*(\d+)/i)
  if (match) {
    const cols = parseInt(match[1])
    const rows = parseInt(match[2])
    return { cols, rows, total: cols * rows }
  }
  const num = parseInt(str)
  return { cols: 6, rows: Math.ceil(num / 6), total: num || 180 }
}

function getOccupiedCount(occupiedStr) {
  if (!occupiedStr || !occupiedStr.trim()) return 0
  return occupiedStr.split(',').filter((s) => s.trim()).length
}

function getOccupancyColor(pct) {
  if (pct > 80) return 'var(--accent-red)'
  if (pct > 55) return 'var(--accent-gold)'
  return 'var(--accent-cyan)'
}

function getUniqueValues(flights, key) {
  return [...new Set(flights.map((f) => f[key]).filter(Boolean))].sort()
}

export default function FlightDashboard() {
  const flights = useStore((s) => s.flights)
  const setActiveFlight = useStore((s) => s.setActiveFlight)
  const [search, setSearch] = useState('')
  const [originFilter, setOriginFilter] = useState('')
  const [destFilter, setDestFilter] = useState('')

  const origins = useMemo(() => getUniqueValues(flights, 'origin'), [flights])
  const destinations = useMemo(() => getUniqueValues(flights, 'destination'), [flights])

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        f.flightId?.toLowerCase().includes(q) ||
        f.origin?.toLowerCase().includes(q) ||
        f.destination?.toLowerCase().includes(q) ||
        f.aircraft?.toLowerCase().includes(q)
      return matchSearch && (!originFilter || f.origin === originFilter) && (!destFilter || f.destination === destFilter)
    })
  }, [flights, search, originFilter, destFilter])

  const totalSeats = flights.reduce((acc, f) => acc + parseCapacity(f.capacity).total, 0)
  const totalOccupied = flights.reduce((acc, f) => acc + getOccupiedCount(f.occupiedSeats), 0)
  const hasFilters = search || originFilter || destFilter

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2>Available Flights</h2>
          <p className="dashboard-header-sub">{flights.length} flights loaded from your data source</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-item">
            <div className="stat-value">{flights.length}</div>
            <div className="stat-label">Flights</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalSeats.toLocaleString()}</div>
            <div className="stat-label">Total Seats</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{(totalSeats - totalOccupied).toLocaleString()}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Math.round((totalOccupied / totalSeats) * 100)}%</div>
            <div className="stat-label">Occupancy</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '16px' }} />
          <input
            className="input"
            style={{ paddingLeft: '42px' }}
            placeholder="Search flights, routes, aircraft..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="flight-search"
          />
        </div>

        <select className="input" style={{ maxWidth: '170px', cursor: 'pointer' }} value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} id="origin-filter">
          <option value="">All Origins</option>
          {origins.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <select className="input" style={{ maxWidth: '200px', cursor: 'pointer' }} value={destFilter} onChange={(e) => setDestFilter(e.target.value)} id="dest-filter">
          <option value="">All Destinations</option>
          {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setOriginFilter(''); setDestFilter('') }}>
            <FiX size={14} /> Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
          Showing {filteredFlights.length} of {flights.length}
        </span>
      </div>

      {filteredFlights.length > 0 ? (
        <div className="flights-grid">
          {filteredFlights.map((flight, i) => {
            const cap = parseCapacity(flight.capacity)
            const occupied = getOccupiedCount(flight.occupiedSeats)
            const pct = Math.round((occupied / cap.total) * 100)
            const available = cap.total - occupied

            return (
              <div key={flight.flightId + '-' + i} className="glass-card flight-card" onClick={() => setActiveFlight(flight)} id={`flight-card-${flight.flightId}`}>
                <div className="flight-card-header">
                  <span className="flight-id">{flight.flightId}</span>
                  <span className="flight-aircraft">{flight.aircraft}</span>
                </div>

                <div className="flight-route">
                  <div className="route-point">
                    <div className="route-code">{flight.origin}</div>
                    <div className="route-time">{flight.departure}</div>
                  </div>
                  <div className="route-line">
                    <div className="route-line-bar">
                      <span className="route-line-plane"><FiNavigation size={14} /></span>
                    </div>
                    <span className="route-duration">{flight.date}</span>
                  </div>
                  <div className="route-point">
                    <div className="route-code">{flight.destination}</div>
                    <div className="route-time">{flight.arrival}</div>
                  </div>
                </div>

                <div className="flight-card-footer">
                  <div className="flight-price">
                    <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>from </span>
                    INR {Number(flight.basePrice).toLocaleString()}
                  </div>
                  <div className="occupancy-bar-container">
                    <div className="occupancy-bar">
                      <div className="occupancy-bar-fill" style={{ width: `${pct}%`, background: getOccupancyColor(pct) }}></div>
                    </div>
                    <span className="occupancy-label">{available} seats left ({pct}% full)</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="no-flights">
          <h3>No flights match your filters</h3>
          <p>Try adjusting your search criteria or clearing filters</p>
        </div>
      )}
    </div>
  )
}
