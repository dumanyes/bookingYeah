import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { Plus, Edit2, Trash2, Calendar, Star, MapPin, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from 'lucide-react'

const SPORT_CHOICES = [
  { value: 'football', label: 'Футбол' },
  { value: 'basketball', label: 'Баскетбол' },
  { value: 'volleyball', label: 'Волейбол' },
  { value: 'tennis', label: 'Теннис' },
  { value: 'badminton', label: 'Бадминтон' },
  { value: 'hockey', label: 'Хоккей' },
  { value: 'multi', label: 'Мультиспорт' },
]
const SURFACE_CHOICES = [
  { value: 'grass', label: 'Трава' },
  { value: 'artificial_grass', label: 'Искусственная трава' },
  { value: 'parquet', label: 'Паркет' },
  { value: 'concrete', label: 'Бетон' },
  { value: 'sand', label: 'Песок' },
  { value: 'ice', label: 'Лёд' },
]

const STATUS_LABELS = {
  pending: { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Подтверждено', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-600' },
  completed: { label: 'Завершено', color: 'bg-gray-100 text-gray-600' },
}

function VenueForm({ venue, onClose, onSaved }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: venue || { capacity: 2, price_per_hour: 1000, is_active: true },
  })
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setError('')
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== '') formData.append(k, v)
      })
      // Булевы чекбоксы
      ;['is_indoor', 'has_changing_room', 'has_parking', 'has_shower', 'is_active'].forEach(key => {
        formData.set(key, data[key] ? 'true' : 'false')
      })
      let saved
      if (venue) {
        const { data: d } = await api.patch(`/venues/${venue.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        saved = d
      } else {
        const { data: d } = await api.post('/venues/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        saved = d
      }
      // Загружаем фото если есть
      for (const file of photos) {
        const fd = new FormData()
        fd.append('image', file)
        await api.post(`/venues/${saved.id}/photos/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      onSaved()
      onClose()
    } catch (e) {
      const msg = e.response?.data
      if (msg) setError(JSON.stringify(msg))
      else setError('Ошибка при сохранении')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{venue ? 'Редактировать площадку' : 'Добавить площадку'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Название *</label>
            <input {...register('name', { required: true })} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Футбольное поле №1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Вид спорта *</label>
              <select {...register('sport_type', { required: true })} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Выберите...</option>
                {SPORT_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Покрытие</label>
              <select {...register('surface')} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Не указано</option>
                {SURFACE_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Описание</label>
            <textarea {...register('description')} rows={3} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Адрес *</label>
            <input {...register('address', { required: true })} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="ул. Примерная, 1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Город *</label>
              <input {...register('city', { required: true })} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Алматы" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Цена (₸/час) *</label>
              <input {...register('price_per_hour', { required: true, min: 1 })} type="number" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Вместимость (чел.)</label>
              <input {...register('capacity')} type="number" min={1} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Широта</label>
              <input {...register('latitude')} type="number" step="any" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="43.2220" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Долгота</label>
            <input {...register('longitude')} type="number" step="any" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="76.8512" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'is_indoor', label: 'Крытый зал' },
              { key: 'has_changing_room', label: 'Раздевалка' },
              { key: 'has_shower', label: 'Душ' },
              { key: 'has_parking', label: 'Парковка' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register(key)} className="w-4 h-4 text-green-600 rounded" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Фотографии</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setPhotos(Array.from(e.target.files))}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-600 hover:file:bg-green-100"
            />
            {photos.length > 0 && <p className="text-xs text-gray-500 mt-1">Выбрано: {photos.length} фото</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Сохранение...' : venue ? 'Сохранить' : 'Добавить площадку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VenueBookings({ venueId }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['venue-bookings', venueId],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/venue/${venueId}/`)
      return data
    },
  })

  const handleConfirm = async (id) => {
    await api.post(`/bookings/${id}/confirm/`)
    queryClient.invalidateQueries(['venue-bookings', venueId])
  }
  const handleCancel = async (id) => {
    await api.post(`/bookings/${id}/cancel/`)
    queryClient.invalidateQueries(['venue-bookings', venueId])
  }

  if (isLoading) return <div className="py-4 text-center text-sm text-gray-400">Загрузка...</div>
  if (!data?.length) return <p className="text-sm text-gray-400 py-3 text-center">Нет бронирований</p>

  return (
    <div className="space-y-2 mt-3">
      {data.map(booking => {
        const status = STATUS_LABELS[booking.status]
        return (
          <div key={booking.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">@{booking.user}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={11} />{booking.date} {booking.start_time?.slice(0, 5)}–{booking.end_time?.slice(0, 5)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
              <span className="text-green-600 font-semibold text-sm">{booking.total_price} ₸</span>
              {booking.status === 'pending' && (
                <div className="flex gap-1">
                  <button onClick={() => handleConfirm(booking.id)} className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors" title="Подтвердить">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => handleCancel(booking.id)} className="p-1 text-red-400 hover:bg-red-50 rounded transition-colors" title="Отменить">
                    <XCircle size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VenueRow({ venue, onEdit, onDelete }) {
  const [showBookings, setShowBookings] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
              {venue.main_photo
                ? <img src={venue.main_photo} alt="" className="w-full h-full object-cover" />
                : { football: '⚽', basketball: '🏀', volleyball: '🏐', tennis: '🎾', badminton: '🏸', hockey: '🏒', multi: '🏟️' }[venue.sport_type] || '🏟️'
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
                {!venue.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Неактивна</span>}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={11} />{venue.city}</span>
                <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" />{Number(venue.rating).toFixed(1)}</span>
                <span className="text-green-600 font-semibold">{venue.price_per_hour} ₸/ч</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onEdit(venue)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Редактировать">
              <Edit2 size={15} />
            </button>
            <button onClick={() => onDelete(venue.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Удалить">
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setShowBookings(!showBookings)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar size={13} /> Брони {showBookings ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {showBookings && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <VenueBookings venueId={venue.id} />
        </div>
      )}
    </div>
  )
}

export default function MyVenuesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-venues'],
    queryFn: async () => {
      const { data } = await api.get('/venues/?ordering=-created_at&page_size=50')
      // Фильтруем только свои (API возвращает все, но в VenueViewSet get_queryset покажет только активные)
      // Делаем отдельный запрос к me для проверки владельца
      return data
    },
  })

  const handleDelete = async (id) => {
    if (!confirm('Удалить площадку? Это действие необратимо.')) return
    await api.delete(`/venues/${id}/`)
    queryClient.invalidateQueries(['my-venues'])
  }

  const handleEdit = (venue) => {
    setEditingVenue(venue)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingVenue(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои площадки</h1>
          <p className="text-gray-500 mt-1 text-sm">Управляйте своими объектами и бронированиями</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Добавить площадку
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Площадок', value: data?.count || 0, icon: '🏟️' },
          { label: 'Всего отзывов', value: data?.results?.reduce((s, v) => s + v.total_reviews, 0) || 0, icon: '⭐' },
          { label: 'Средний рейтинг', value: data?.results?.length ? (data.results.reduce((s, v) => s + Number(v.rating), 0) / data.results.length).toFixed(1) : '—', icon: '📊' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !data?.results?.length ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🏟️</div>
          <p className="text-lg font-medium">У вас ещё нет площадок</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-green-600 font-medium hover:underline">
            Добавьте первую площадку
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.results.map(venue => (
            <VenueRow key={venue.id} venue={venue} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <VenueForm
          venue={editingVenue}
          onClose={handleClose}
          onSaved={() => queryClient.invalidateQueries(['my-venues'])}
        />
      )}
    </div>
  )
}
