import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { Users, MapPin, Calendar, Plus, Send } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useForm } from 'react-hook-form'

const SPORTS = [
  { value: '', label: 'Все виды' },
  { value: 'football', label: '⚽ Футбол' },
  { value: 'basketball', label: '🏀 Баскетбол' },
  { value: 'volleyball', label: '🏐 Волейбол' },
  { value: 'tennis', label: '🎾 Теннис' },
  { value: 'badminton', label: '🏸 Бадминтон' },
  { value: 'hockey', label: '🏒 Хоккей' },
]

const LEVELS = [
  { value: '', label: 'Любой уровень' },
  { value: 'beginner', label: 'Новичок' },
  { value: 'amateur', label: 'Любитель' },
  { value: 'semi_pro', label: 'Полупро' },
  { value: 'pro', label: 'Профи' },
]

function PostCard({ post, onApply }) {
  const { isAuthenticated, user } = useAuthStore()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [message, setMessage] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleApply = async () => {
    setApplying(true)
    try {
      await onApply(post.id, message)
      setApplied(true)
      setShowInput(false)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{post.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{post.sport_display}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.level_display}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
            <Users size={14} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{post.players_needed}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1"><MapPin size={12} />{post.city}</span>
        {post.play_date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(post.play_date), 'd MMM', { locale: ru })}
            {post.play_time && ` в ${post.play_time.slice(0, 5)}`}
          </span>
        )}
        <span className="text-gray-400">от @{post.author.username}</span>
      </div>

      {isAuthenticated && post.author.id !== user?.id && (
        applied ? (
          <p className="text-sm text-green-600 font-medium">Отклик отправлен ✓</p>
        ) : showInput ? (
          <div className="flex gap-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Сообщение (необязательно)"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Send size={14} />
              {applying ? '...' : 'Отправить'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"
          >
            <Users size={14} />
            Откликнуться
          </button>
        )
      )}
    </div>
  )
}

function CreatePostModal({ onClose, onCreated }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    await api.post('/teammates/posts/', data)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Новый пост тиммейта</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input {...register('title', { required: true })} placeholder="Заголовок *" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <select {...register('sport', { required: true })} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Выберите спорт *</option>
            {SPORTS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <textarea {...register('description', { required: true })} placeholder="Описание *" rows={3} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input {...register('city', { required: true })} placeholder="Город *" className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input {...register('players_needed', { required: true, min: 1 })} type="number" defaultValue={1} placeholder="Нужно игроков" className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <select {...register('required_level')} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            {LEVELS.map(l => <option key={l.value} value={l.value || 'any'}>{l.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input {...register('play_date')} type="date" className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input {...register('play_time')} type="time" className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Создание...' : 'Создать пост'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeammatesPage() {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [sport, setSport] = useState('')
  const [city, setCity] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['teammate-posts', sport, city],
    queryFn: async () => {
      const params = {}
      if (sport) params.sport = sport
      if (city) params.city = city
      const { data } = await api.get('/teammates/posts/', { params })
      return data
    },
  })

  const handleApply = async (postId, message) => {
    await api.post(`/teammates/posts/${postId}/apply/`, { message })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Поиск тиммейтов</h1>
          <p className="text-gray-500 mt-1">Найдите игроков для совместной игры</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
            <Plus size={16} />
            Создать пост
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <select value={sport} onChange={e => setSport(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Город" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-36" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !data?.results?.length ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Постов не найдено</p>
          {isAuthenticated && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-green-600 font-medium hover:underline">
              Создайте первый пост
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.results.map(post => (
            <PostCard key={post.id} post={post} onApply={handleApply} />
          ))}
        </div>
      )}

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={() => queryClient.invalidateQueries(['teammate-posts'])}
        />
      )}
    </div>
  )
}
