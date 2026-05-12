import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { MapPin, Star, List, Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SPORT_COLORS = {
  football: '#16a34a',
  basketball: '#ea580c',
  volleyball: '#2563eb',
  tennis: '#ca8a04',
  badminton: '#9333ea',
  hockey: '#0891b2',
  multi: '#6b7280',
}

function createIcon(sport) {
  const color = SPORT_COLORS[sport] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

function FitBounds({ venues }) {
  const map = useMap()
  if (venues?.length) {
    const valid = venues.filter(v => v.latitude && v.longitude)
    if (valid.length) {
      const bounds = L.latLngBounds(valid.map(v => [parseFloat(v.latitude), parseFloat(v.longitude)]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }
  return null
}

const SPORT_ICONS = { football: '⚽', basketball: '🏀', volleyball: '🏐', tennis: '🎾', badminton: '🏸', hockey: '🏒', multi: '🏟️' }
const SPORTS = [
  { value: '', label: 'Все виды' },
  { value: 'football', label: '⚽ Футбол' },
  { value: 'basketball', label: '🏀 Баскетбол' },
  { value: 'volleyball', label: '🏐 Волейбол' },
  { value: 'tennis', label: '🎾 Теннис' },
  { value: 'badminton', label: '🏸 Бадминтон' },
  { value: 'hockey', label: '🏒 Хоккей' },
]

export default function MapPage() {
  const [sport, setSport] = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('map') // 'map' | 'list'

  const { data } = useQuery({
    queryKey: ['venues-map', sport],
    queryFn: async () => {
      const params = { page_size: 100 }
      if (sport) params.sport_type = sport
      const { data } = await api.get('/venues/', { params })
      return data
    },
  })

  const venues = data?.results || []
  const withCoords = venues.filter(v => v.latitude && v.longitude)

  // Центр Алматы по умолчанию
  const center = [43.2220, 76.8512]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Карта площадок</h1>
          <p className="text-gray-500 text-sm mt-0.5">{venues.length} площадок найдено</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sport}
            onChange={e => setSport(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${view === 'map' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Map size={15} /> Карта
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={15} /> Список
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>
          {/* Карта */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 h-full">
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {withCoords.length > 0 && <FitBounds venues={withCoords} />}
              {withCoords.map(venue => (
                <Marker
                  key={venue.id}
                  position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}
                  icon={createIcon(venue.sport_type)}
                  eventHandlers={{ click: () => setSelected(venue) }}
                >
                  <Popup>
                    <div className="min-w-44">
                      <p className="font-semibold text-gray-900 text-sm">{venue.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{venue.address}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="flex items-center gap-0.5 text-xs">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {Number(venue.rating).toFixed(1)}
                        </span>
                        <span className="text-green-600 font-bold text-sm">{venue.price_per_hour} ₸/ч</span>
                      </div>
                      <Link
                        to={`/venues/${venue.id}`}
                        className="block mt-2 text-center bg-green-600 text-white text-xs py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Забронировать
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Список сбоку */}
          <div className="overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {venues.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Площадки не найдены</p>
              </div>
            ) : (
              venues.map(venue => (
                <div
                  key={venue.id}
                  onClick={() => setSelected(venue)}
                  className={`bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-sm ${selected?.id === venue.id ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-100'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                      {venue.main_photo
                        ? <img src={venue.main_photo} alt="" className="w-full h-full object-cover rounded-lg" />
                        : SPORT_ICONS[venue.sport_type] || '🏟️'
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{venue.name}</p>
                      <p className="text-xs text-gray-500 truncate">{venue.city}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="flex items-center gap-0.5 text-xs text-gray-500">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {Number(venue.rating).toFixed(1)}
                        </span>
                        <span className="text-green-600 font-semibold text-xs">{venue.price_per_hour} ₸/ч</span>
                      </div>
                    </div>
                  </div>
                  {!venue.latitude && (
                    <p className="text-xs text-orange-400 mt-1.5">📍 Координаты не указаны</p>
                  )}
                  <Link
                    to={`/venues/${venue.id}`}
                    onClick={e => e.stopPropagation()}
                    className="block mt-2 text-center text-xs text-green-600 font-medium hover:underline"
                  >
                    Подробнее →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map(venue => (
            <Link key={venue.id} to={`/venues/${venue.id}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{SPORT_ICONS[venue.sport_type] || '🏟️'}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{venue.name}</p>
                  <p className="text-xs text-gray-500">{venue.sport_type_display}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <MapPin size={11} />{venue.city}, {venue.address}
              </p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {Number(venue.rating).toFixed(1)} ({venue.total_reviews})
                </span>
                <span className="text-green-600 font-bold">{venue.price_per_hour} ₸/ч</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
