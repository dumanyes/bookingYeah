import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import VenueCard from '../components/VenueCard'
import { Search, SlidersHorizontal } from 'lucide-react'

const SPORTS = [
  { value: '', label: 'Все виды' },
  { value: 'football', label: '⚽ Футбол' },
  { value: 'basketball', label: '🏀 Баскетбол' },
  { value: 'volleyball', label: '🏐 Волейбол' },
  { value: 'tennis', label: '🎾 Теннис' },
  { value: 'badminton', label: '🏸 Бадминтон' },
  { value: 'hockey', label: '🏒 Хоккей' },
]

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const sport = searchParams.get('sport_type') || ''
  const city = searchParams.get('city') || ''
  const isIndoor = searchParams.get('is_indoor') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['venues', sport, city, isIndoor, search],
    queryFn: async () => {
      const params = {}
      if (sport) params.sport_type = sport
      if (city) params.city = city
      if (isIndoor) params.is_indoor = isIndoor
      if (search) params.search = search
      const { data } = await api.get('/venues/', { params })
      return data
    },
  })

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Спортивные площадки</h1>
        <p className="text-gray-500">Найдите и забронируйте площадку в вашем городе</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию, адресу..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={sport}
          onChange={e => setFilter('sport_type', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input
          value={city}
          onChange={e => setFilter('city', e.target.value)}
          placeholder="Город"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-36"
        />
        <select
          value={isIndoor}
          onChange={e => setFilter('is_indoor', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">Все (крытые/открытые)</option>
          <option value="true">Крытые</option>
          <option value="false">Открытые</option>
        </select>
      </div>

      {/* Результаты */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
          ))}
        </div>
      ) : data?.results?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🏟️</div>
          <p className="text-lg font-medium">Площадки не найдены</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">Найдено: {data?.count} площадок</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data?.results?.map(venue => <VenueCard key={venue.id} venue={venue} />)}
          </div>
        </>
      )}
    </div>
  )
}
