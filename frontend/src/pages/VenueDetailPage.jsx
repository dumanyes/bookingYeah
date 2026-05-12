import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { MapPin, Star, Clock, Users, CheckCircle, XCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7:00 - 22:00

export default function VenueDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startHour, setStartHour] = useState(null)
  const [endHour, setEndHour] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      const { data } = await api.get(`/venues/${id}/`)
      return data
    },
  })

  const { data: availability } = useQuery({
    queryKey: ['availability', id, selectedDate],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/availability/${id}/`, { params: { date: selectedDate } })
      return data
    },
  })

  const isSlotBooked = (hour) => {
    if (!availability?.booked_slots) return false
    return availability.booked_slots.some(slot => {
      const start = parseInt(slot.start_time)
      const end = parseInt(slot.end_time)
      return hour >= start && hour < end
    })
  }

  const handleBook = async () => {
    if (!isAuthenticated) return navigate('/login')
    if (!startHour || !endHour || startHour >= endHour) {
      setBookingError('Выберите корректное время')
      return
    }
    setIsBooking(true)
    setBookingError('')
    try {
      await api.post('/bookings/', {
        venue: id,
        date: selectedDate,
        start_time: `${String(startHour).padStart(2, '0')}:00:00`,
        end_time: `${String(endHour).padStart(2, '0')}:00:00`,
        players_count: 1,
      })
      setBookingSuccess(true)
      setStartHour(null)
      setEndHour(null)
    } catch (e) {
      setBookingError(e.response?.data?.non_field_errors?.[0] || 'Ошибка при бронировании')
    } finally {
      setIsBooking(false)
    }
  }

  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  if (isLoading) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl" />

  if (!venue) return <div className="text-center py-20 text-gray-400">Площадка не найдена</div>

  const totalPrice = startHour && endHour && endHour > startHour
    ? (endHour - startHour) * Number(venue.price_per_hour)
    : null

  return (
    <div className="max-w-5xl mx-auto">
      {/* Фото */}
      <div className="h-72 bg-gray-100 rounded-2xl overflow-hidden mb-6">
        {venue.photos?.[0] ? (
          <img src={venue.photos[0].image} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🏟️</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Инфо */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                  <MapPin size={15} />
                  <span>{venue.address}, {venue.city}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{venue.price_per_hour} ₸</div>
                <div className="text-sm text-gray-400">в час</div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{Number(venue.rating).toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({venue.total_reviews} отзывов)</span>
              </div>
              <span className="bg-gray-100 text-gray-600 text-sm px-3 py-0.5 rounded-full">
                {venue.sport_type_display}
              </span>
              {venue.is_indoor && (
                <span className="bg-blue-100 text-blue-600 text-sm px-3 py-0.5 rounded-full">Крытый</span>
              )}
            </div>
          </div>

          {venue.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Описание</h2>
              <p className="text-gray-600 leading-relaxed">{venue.description}</p>
            </div>
          )}

          {/* Удобства */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Удобства</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'has_changing_room', label: 'Раздевалка' },
                { key: 'has_shower', label: 'Душ' },
                { key: 'has_parking', label: 'Парковка' },
                { key: 'is_indoor', label: 'Крытый зал' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {venue[key]
                    ? <CheckCircle size={16} className="text-green-500" />
                    : <XCircle size={16} className="text-gray-300" />}
                  <span className={venue[key] ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Отзывы */}
          {venue.reviews?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Отзывы</h2>
              <div className="space-y-3">
                {venue.reviews.slice(0, 3).map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{r.author.username}</span>
                      <div className="flex items-center gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Бронирование */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Забронировать</h2>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Бронь создана!</p>
                <p className="text-sm text-gray-500 mt-1">Проверьте ваши брони в личном кабинете</p>
                <button onClick={() => setBookingSuccess(false)} className="mt-4 text-green-600 text-sm font-medium hover:underline">
                  Забронировать ещё раз
                </button>
              </div>
            ) : (
              <>
                {/* Дата */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Дата</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {nextDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd')
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs border transition-all ${
                            selectedDate === dateStr
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-200 text-gray-700 hover:border-green-400'
                          }`}
                        >
                          <span>{format(day, 'EEE', { locale: ru })}</span>
                          <span className="font-semibold">{format(day, 'd')}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Время */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Время (нажмите начало и конец)</p>
                  <div className="grid grid-cols-4 gap-1">
                    {HOURS.map(h => {
                      const booked = isSlotBooked(h)
                      const selected = startHour !== null && endHour !== null && h >= startHour && h < endHour
                      const isStart = h === startHour
                      return (
                        <button
                          key={h}
                          disabled={booked}
                          onClick={() => {
                            if (!startHour || (startHour && endHour)) {
                              setStartHour(h)
                              setEndHour(null)
                            } else if (h > startHour) {
                              setEndHour(h + 1)
                            } else {
                              setStartHour(h)
                              setEndHour(null)
                            }
                          }}
                          className={`text-xs py-1.5 rounded-md transition-all ${
                            booked ? 'bg-red-50 text-red-300 cursor-not-allowed'
                            : selected || isStart ? 'bg-green-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-green-50 border border-gray-100'
                          }`}
                        >
                          {String(h).padStart(2, '0')}:00
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1 align-middle" />занято
                    <span className="inline-block w-3 h-3 bg-green-600 rounded ml-3 mr-1 align-middle" />выбрано
                  </p>
                </div>

                {totalPrice !== null && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {endHour - startHour} ч × {venue.price_per_hour} ₸
                    </span>
                    <span className="font-bold text-green-600">{totalPrice} ₸</span>
                  </div>
                )}

                {bookingError && (
                  <p className="text-sm text-red-500 mb-3">{bookingError}</p>
                )}

                <button
                  onClick={handleBook}
                  disabled={isBooking || !startHour || !endHour}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40"
                >
                  {isBooking ? 'Бронирование...' : 'Забронировать'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
