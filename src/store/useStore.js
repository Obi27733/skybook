import { create } from 'zustand'

const SAMPLE_DATA = [
  { flightId: 'SK101', origin: 'DEL', destination: 'MUM', departure: '06:00', arrival: '08:15', capacity: '6x30', occupiedSeats: '1A,1B,2B,2F,3C,3D,5D,5E,6F,8A,8C,10A,10F,12B,12E,14C,15C,15D,17A,18D,20E,20F,22F,24A,24B,25A,26C,28B,28D,29F', basePrice: 3499, airline: 'SkyBook Air', aircraft: 'Boeing 737-800', date: '2026-04-15' },
  { flightId: 'SK204', origin: 'BOM', destination: 'BLR', departure: '09:30', arrival: '11:15', capacity: '6x25', occupiedSeats: '1A,1F,2A,2C,3F,4B,5E,7B,7D,8E,9A,10C,11C,12F,14D,16A,17B,19F,20A,22B,23E,24C', basePrice: 2999, airline: 'SkyBook Air', aircraft: 'Airbus A320', date: '2026-04-15' },
  { flightId: 'SK307', origin: 'BLR', destination: 'CCU', departure: '14:00', arrival: '16:45', capacity: '6x28', occupiedSeats: '1A,1C,1E,2B,2D,4D,6A,6F,8B,9F,10E,12E,14A,15B,16D,18C,20A,21F,23C,24D,26D,27B', basePrice: 4299, airline: 'SkyBook Air', aircraft: 'Boeing 737 MAX', date: '2026-04-16' },
  { flightId: 'SK410', origin: 'HYD', destination: 'DEL', departure: '18:30', arrival: '20:50', capacity: '6x32', occupiedSeats: '1A,1F,2A,2F,3A,3B,3E,5E,7C,8C,8D,9A,10F,11D,14A,14F,16B,17F,19C,20B,21A,23E,25D,26C,28A,29D,30F,31A,31E,32C', basePrice: 5199, airline: 'SkyBook Air', aircraft: 'Airbus A321neo', date: '2026-04-16' },
  { flightId: 'SK515', origin: 'MAA', destination: 'GOI', departure: '07:15', arrival: '08:45', capacity: '6x20', occupiedSeats: '1B,1D,2A,3E,4F,5A,5C,6D,8F,10B,12C,14A,15D,16F,18E,19A', basePrice: 1999, airline: 'SkyBook Air', aircraft: 'ATR 72-600', date: '2026-04-17' },
  { flightId: 'SK602', origin: 'DEL', destination: 'BLR', departure: '05:30', arrival: '08:10', capacity: '6x32', occupiedSeats: '1A,1B,1E,2C,2F,3A,4D,5F,6B,7E,9A,10C,11F,13B,14D,16A,18E,19C,20F,22A,23B,25D,27F,28A,29C,30E,31B,32D', basePrice: 4599, airline: 'SkyBook Air', aircraft: 'Airbus A321neo', date: '2026-04-15' },
  { flightId: 'SK718', origin: 'CCU', destination: 'DEL', departure: '11:00', arrival: '13:20', capacity: '6x28', occupiedSeats: '1C,1F,2A,3B,4E,5D,6A,8C,9F,10B,12D,13A,15E,16F,18B,19C,21A,22D,24F,25B,27C', basePrice: 3899, airline: 'SkyBook Air', aircraft: 'Boeing 737 MAX', date: '2026-04-15' },
  { flightId: 'SK825', origin: 'GOI', destination: 'DEL', departure: '16:45', arrival: '19:15', capacity: '6x25', occupiedSeats: '1A,2B,2F,3C,4D,5A,6E,7F,9B,10C,11D,13A,14F,16E,17B,19C,20A,22D,24F', basePrice: 4799, airline: 'SkyBook Air', aircraft: 'Airbus A320neo', date: '2026-04-16' },
  { flightId: 'SK933', origin: 'MUM', destination: 'CCU', departure: '08:00', arrival: '10:30', capacity: '6x30', occupiedSeats: '1A,1D,2B,2E,3C,3F,4A,5B,6D,7F,8A,9C,10E,11B,12D,13F,15A,16C,18E,19B,20D,22F,23A,24C,26E,27B,29D,30F', basePrice: 5699, airline: 'SkyBook Air', aircraft: 'Boeing 737-800', date: '2026-04-16' },
  { flightId: 'SK1041', origin: 'BLR', destination: 'HYD', departure: '12:30', arrival: '13:45', capacity: '6x22', occupiedSeats: '1A,1F,2C,3B,4E,5D,7A,8F,10B,11C,13E,14D,16A,17F,19B,20C,22D', basePrice: 2499, airline: 'SkyBook Air', aircraft: 'Airbus A220', date: '2026-04-17' },
  { flightId: 'SK1155', origin: 'DEL', destination: 'GOI', departure: '15:00', arrival: '17:30', capacity: '6x28', occupiedSeats: '1B,2A,2D,3C,4F,5E,6B,7A,8D,9C,10F,12B,13E,14A,16D,17C,18F,20B,21E,23A,24D,26C,27F', basePrice: 3799, airline: 'SkyBook Air', aircraft: 'Boeing 737 MAX', date: '2026-04-17' },
  { flightId: 'SK1268', origin: 'MAA', destination: 'DEL', departure: '20:00', arrival: '22:40', capacity: '6x30', occupiedSeats: '1A,1C,1E,2B,2D,2F,3A,3C,4B,4E,5D,6F,7A,8C,9E,10B,11D,12F,14A,15C,17E,18B,20D,21F,23A,24C,26E,28B,29D,30F', basePrice: 4199, airline: 'SkyBook Air', aircraft: 'Boeing 737-800', date: '2026-04-15' },
  { flightId: 'SK1372', origin: 'HYD', destination: 'MUM', departure: '06:45', arrival: '08:15', capacity: '6x25', occupiedSeats: '1A,1B,1E,2C,3D,3F,5B,6A,7E,8C,9F,11B,12D,14A,15E,17C,18F,20B,21D,23A,24E', basePrice: 2799, airline: 'SkyBook Air', aircraft: 'Airbus A320', date: '2026-04-16' },
  { flightId: 'SK1489', origin: 'CCU', destination: 'BLR', departure: '10:15', arrival: '13:00', capacity: '6x28', occupiedSeats: '1D,2A,2F,3B,3E,4C,5A,6F,7D,8B,9E,10C,12A,13F,14D,16B,17E,19C,20A,21F,23D,25B,26E,28C', basePrice: 5299, airline: 'SkyBook Air', aircraft: 'Airbus A321neo', date: '2026-04-17' },
  { flightId: 'SK1590', origin: 'MUM', destination: 'HYD', departure: '13:45', arrival: '15:00', capacity: '6x22', occupiedSeats: '1A,1C,2B,2E,3D,4A,5F,6C,7B,8E,10D,11A,13F,14C,16B,18E,20D,21A', basePrice: 2299, airline: 'SkyBook Air', aircraft: 'Airbus A220', date: '2026-04-15' },
  { flightId: 'SK1695', origin: 'GOI', destination: 'MUM', departure: '19:30', arrival: '20:45', capacity: '6x20', occupiedSeats: '1A,1F,2B,2E,3C,4D,5A,6F,8B,9E,10C,12D,14A,15F,17B,18E,20C', basePrice: 1899, airline: 'SkyBook Air', aircraft: 'ATR 72-600', date: '2026-04-16' },
  { flightId: 'SK1800', origin: 'BLR', destination: 'DEL', departure: '22:00', arrival: '00:30', capacity: '6x32', occupiedSeats: '1A,1B,1C,2D,2E,2F,3A,3B,4C,4D,5E,5F,6A,7B,8C,9D,10E,11F,13A,14B,16C,17D,19E,20F,22A,23B,25C,27D,29E,30F,31A,32B', basePrice: 3999, airline: 'SkyBook Air', aircraft: 'Boeing 737-800', date: '2026-04-17' },
  { flightId: 'SK1912', origin: 'DEL', destination: 'CCU', departure: '04:30', arrival: '06:45', capacity: '6x30', occupiedSeats: '1A,1D,2B,2E,3C,3F,5A,5D,7B,7E,9C,9F,11A,11D,13B,13E,15C,15F,17A,18D,20B,22E,24C,26F,28A,29D', basePrice: 4099, airline: 'SkyBook Air', aircraft: 'Airbus A321neo', date: '2026-04-16' },
  { flightId: 'SK2020', origin: 'MUM', destination: 'BLR', departure: '17:00', arrival: '18:45', capacity: '6x25', occupiedSeats: '1B,1E,2A,2D,3C,3F,4B,5E,6A,7D,8C,9F,11B,12E,14A,15D,17C,18F,20B,22E,24A', basePrice: 3299, airline: 'SkyBook Air', aircraft: 'Airbus A320neo', date: '2026-04-15' },
  { flightId: 'SK2135', origin: 'HYD', destination: 'CCU', departure: '09:00', arrival: '11:30', capacity: '6x28', occupiedSeats: '1A,1C,1E,2B,2D,2F,3A,4C,5E,6B,7D,8F,10A,11C,13E,14B,16D,18F,20A,22C,24E,26B,28D', basePrice: 4899, airline: 'SkyBook Air', aircraft: 'Boeing 737 MAX', date: '2026-04-17' }
]

const useStore = create((set, get) => ({
  step: 'upload',
  flights: [],
  activeFlight: null,
  selectedSeat: null,
  passengerName: '',
  passengerEmail: '',
  user: null,
  paymentInfo: null,

  setStep: (step) => set({ step }),

  setFlights: (flights) => {
    const { user } = get()
    set({ flights, step: user ? 'dashboard' : 'login' })
  },

  loadSampleData: () => {
    const { user } = get()
    set({ flights: SAMPLE_DATA, step: user ? 'dashboard' : 'login' })
  },

  login: (userData) => {
    const { flights } = get()
    set({
      user: userData,
      passengerName: userData.name,
      passengerEmail: userData.email,
      step: flights.length > 0 ? 'dashboard' : 'upload'
    })
  },

  logout: () => set({
    user: null,
    step: 'upload',
    flights: [],
    activeFlight: null,
    selectedSeat: null,
    passengerName: '',
    passengerEmail: '',
    paymentInfo: null
  }),

  setActiveFlight: (flight) => set({ activeFlight: flight, selectedSeat: null, step: 'seatmap' }),
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  setPassengerName: (name) => set({ passengerName: name }),
  setPassengerEmail: (email) => set({ passengerEmail: email }),

  confirmBooking: () => {
    const { passengerName } = get()
    if (!passengerName.trim()) return false
    set({ step: 'payment' })
    return true
  },

  completePayment: (info) => {
    set({ paymentInfo: info, step: 'boarding' })
  },

  goBack: () => {
    const { step } = get()
    if (step === 'login') set({ step: 'upload', flights: [] })
    else if (step === 'dashboard') set({ step: 'upload', flights: [], activeFlight: null, selectedSeat: null })
    else if (step === 'seatmap') set({ step: 'dashboard', activeFlight: null, selectedSeat: null })
    else if (step === 'payment') set({ step: 'seatmap' })
    else if (step === 'boarding') set({ step: 'seatmap' })
  },

  resetAll: () => set({
    step: 'upload',
    flights: [],
    activeFlight: null,
    selectedSeat: null,
    passengerName: '',
    passengerEmail: '',
    paymentInfo: null
  })
}))

export default useStore

