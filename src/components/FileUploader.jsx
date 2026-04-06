import React, { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import useStore from '../store/useStore'
import { FiUploadCloud, FiFileText, FiZap, FiShield, FiFile, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const REQUIRED_COLUMNS = ['Flight ID', 'Origin', 'Destination', 'Departure', 'Arrival', 'Capacity', 'Occupied Seats', 'Base Price']

const COLUMN_MAP = {
  'flight id': 'flightId',
  'origin': 'origin',
  'destination': 'destination',
  'departure': 'departure',
  'arrival': 'arrival',
  'capacity': 'capacity',
  'occupied seats': 'occupiedSeats',
  'base price': 'basePrice',
  'airline': 'airline',
  'aircraft': 'aircraft',
  'date': 'date'
}

function normalizeRow(row) {
  const normalized = {}
  for (const key of Object.keys(row)) {
    const lower = key.toLowerCase().trim()
    const mapped = COLUMN_MAP[lower]
    if (mapped) normalized[mapped] = row[key]
  }
  if (!normalized.airline) normalized.airline = 'SkyBook Air'
  if (!normalized.aircraft) normalized.aircraft = 'Unknown'
  if (!normalized.date) normalized.date = new Date().toISOString().split('T')[0]
  if (typeof normalized.basePrice === 'string') {
    normalized.basePrice = parseFloat(normalized.basePrice.replace(/[^0-9.]/g, '')) || 0
  }
  if (typeof normalized.occupiedSeats !== 'string') {
    normalized.occupiedSeats = String(normalized.occupiedSeats || '')
  }
  return normalized
}

function validateData(rows) {
  if (!rows || rows.length === 0) return 'The Excel file contains no data rows.'
  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col.toLowerCase()))
  if (missing.length > 0) return `Missing required columns: ${missing.join(', ')}`
  for (let i = 0; i < rows.length; i++) {
    const norm = normalizeRow(rows[i])
    if (!norm.flightId) return `Row ${i + 2}: Missing Flight ID`
    if (!norm.origin) return `Row ${i + 2}: Missing Origin`
    if (!norm.destination) return `Row ${i + 2}: Missing Destination`
    if (!norm.capacity) return `Row ${i + 2}: Missing Capacity`
  }
  return null
}

export default function FileUploader() {
  const setFlights = useStore((s) => s.setFlights)
  const loadSampleData = useStore((s) => s.loadSampleData)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const processFile = useCallback((file) => {
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload a valid Excel file (.xlsx, .xls, or .csv)')
      return
    }
    setLoading(true)
    setError(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        const validationError = validateData(jsonData)
        if (validationError) {
          setError(validationError)
          setLoading(false)
          return
        }
        const flights = jsonData.map(normalizeRow)
        setTimeout(() => { setFlights(flights); setLoading(false) }, 400)
      } catch (err) {
        setError('Failed to parse the Excel file. Please check the format.')
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }, [setFlights])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  return (
    <div className="uploader-container">
      <div className="uploader-hero animate-fade-in">
        <h1>Welcome to SkyBook</h1>
        <p>
          Upload your flight data spreadsheet to power up the reservation dashboard.
          Zero servers, zero cloud — everything runs right here in your browser.
        </p>
      </div>

      <div
        className={`dropzone animate-fade-in-delay-1 ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        id="file-dropzone"
      >
        <div className="dropzone-content">
          <div className="dropzone-icon">
            {loading ? <FiFile size={48} /> : <FiUploadCloud size={48} />}
          </div>
          {loading ? (
            <>
              <h3>Processing {fileName}...</h3>
              <p>Validating columns and parsing flight data</p>
            </>
          ) : (
            <>
              <h3>Drop your Excel file here</h3>
              <p>or click to browse — supports .xlsx, .xls, .csv</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={(e) => processFile(e.target.files[0])}
          id="file-input"
        />
      </div>

      {error && (
        <div className="validation-error animate-fade-in">
          <FiAlertTriangle style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {error}
        </div>
      )}

      {fileName && !error && !loading && (
        <div className="file-info animate-fade-in">
          <FiCheckCircle /> {fileName} loaded successfully
        </div>
      )}

      <div className="upload-divider"><span>or start instantly</span></div>

      <button className="btn btn-secondary btn-lg animate-fade-in-delay-2" onClick={loadSampleData} id="sample-data-btn">
        <FiZap /> Launch with Sample Data (20 flights)
      </button>

      <div className="features-grid animate-fade-in-delay-3">
        <div className="feature-card">
          <div className="feature-icon privacy"><FiShield size={22} /></div>
          <h4>100% Private</h4>
          <p>Your data never leaves the browser. No servers, no tracking, no cloud dependency.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon speed"><FiZap size={22} /></div>
          <h4>Instant Parsing</h4>
          <p>SheetJS converts your spreadsheet to live, interactive data in milliseconds.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon pdf"><FiFileText size={22} /></div>
          <h4>PDF Boarding Pass</h4>
          <p>Generate and download printable boarding passes without any server round-trip.</p>
        </div>
      </div>
    </div>
  )
}
