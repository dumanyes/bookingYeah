import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, Calendar, XCircle } from 'lucide-react'
import { useState } from 'react'

const STATUS_LABELS = {
  pending: { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Подтверждено', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-600' },
  completed: { label: 'Завершено', color: 'bg-gray-100 text-gray-600' },
}

export default function MyBookingsPage() {
  const queryClient = useQueryClient()
  const [cancelling, setCancelling] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/')
      return data
    },
  })

  const handleCancel = async (id) => {
    setCancelling(id)
    try {
      await api.post(`/bookings/${id}/cancel/`)
      queryClient.invalidateQueries(['my-bookings'])
    } finally {
      setCancelling(null)
    }
  }

  if (isLoading) return <div className="animate-pulse space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Мои бронирования</h1>

      {!data?.results?.length ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">У вас ещё нет бронирований</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.results.map(booking => {
            const status = STATUS_LABELS[booking.status]
            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{booking.venue_detail?.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {format(new Date(booking.date), 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {booking.start_time.slice(0, 5)} — {booking.end_time.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {booking.venue_detail?.city}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-green-600 text-lg">{booking.total_price} ₸</div>
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1 ml-auto transition-colors"
                    >
                      <XCircle size={13} />
                      {cancelling === booking.id ? 'Отмена...' : 'Отменить'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
