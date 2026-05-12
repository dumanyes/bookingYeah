import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { User, Camera, Star, Calendar, Trophy, Edit3, Lock, CheckCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SPORTS = [
  { value: 'football', label: '⚽ Футбол' },
  { value: 'basketball', label: '🏀 Баскетбол' },
  { value: 'volleyball', label: '🏐 Волейбол' },
  { value: 'tennis', label: '🎾 Теннис' },
  { value: 'badminton', label: '🏸 Бадминтон' },
  { value: 'hockey', label: '🏒 Хоккей' },
  { value: 'other', label: '🏅 Другое' },
]
const LEVELS = [
  { value: 'beginner', label: 'Новичок' },
  { value: 'amateur', label: 'Любитель' },
  { value: 'semi_pro', label: 'Полупрофессионал' },
  { value: 'pro', label: 'Профессионал' },
]

function EditProfileForm({ user, onSuccess }) {
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      city: user.city,
      favorite_sport: user.favorite_sport,
      level: user.level,
      is_looking_for_team: user.is_looking_for_team,
    },
  })
  const [saved, setSaved] = useState(false)

  const onSubmit = async (data) => {
    await api.patch('/users/me/', data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Имя</label>
          <input {...register('first_name')} className="input-field" placeholder="Имя" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Фамилия</label>
          <input {...register('last_name')} className="input-field" placeholder="Фамилия" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input {...register('email')} type="email" className="input-field" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Телефон</label>
        <input {...register('phone')} className="input-field" placeholder="+7 (777) 777-77-77" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Город</label>
        <input {...register('city')} className="input-field" placeholder="Алматы" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">О себе</label>
        <textarea {...register('bio')} rows={3} className="input-field resize-none" placeholder="Расскажите о себе..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Любимый спорт</label>
          <select {...register('favorite_sport')} className="input-field bg-white">
            <option value="">Не выбрано</option>
            {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Уровень</label>
          <select {...register('level')} className="input-field bg-white">
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register('is_looking_for_team')} className="w-4 h-4 text-green-600 rounded" />
        <span className="text-sm text-gray-700">Ищу тиммейтов</span>
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saved ? <><CheckCircle size={16} /> Сохранено!</> : isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </form>
  )
}

function ChangePasswordForm() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data) => {
    setError('')
    if (data.new_password !== data.confirm_password) {
      setError('Новые пароли не совпадают')
      return
    }
    try {
      await api.post('/users/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password,
      })
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Ошибка')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1"><CheckCircle size={14} /> Пароль изменён!</p>}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Текущий пароль</label>
        <input {...register('old_password', { required: true })} type="password" className="input-field" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Новый пароль</label>
        <input {...register('new_password', { required: true, minLength: 8 })} type="password" className="input-field" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Повторите новый пароль</label>
        <input {...register('confirm_password', { required: true })} type="password" className="input-field" />
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-gray-800 text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50">
        {isSubmitting ? 'Изменение...' : 'Изменить пароль'}
      </button>
    </form>
  )
}

export default function ProfilePage() {
  const { user: authUser, fetchMe } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('edit')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/')
      return data
    },
  })

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/')
      return data
    },
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      await api.patch('/users/me/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      queryClient.invalidateQueries(['me'])
      fetchMe()
    } finally {
      setAvatarUploading(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-40 bg-gray-100 rounded-2xl mb-6" />
      <div className="h-96 bg-gray-100 rounded-2xl" />
    </div>
  )

  const levelLabel = LEVELS.find(l => l.value === user?.level)?.label || ''
  const sportLabel = SPORTS.find(s => s.value === user?.favorite_sport)?.label || ''

  return (
    <div className="max-w-4xl mx-auto">
      {/* Шапка профиля */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : <User size={36} className="text-white/70" />
              }
            </div>
            <label className={`absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow hover:bg-gray-50 transition-colors ${avatarUploading ? 'opacity-50' : ''}`}>
              <Camera size={14} className="text-gray-600" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={avatarUploading} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">
              {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h1>
            <p className="text-green-100 text-sm">@{user?.username}</p>
            {user?.bio && <p className="text-green-100 text-sm mt-1 line-clamp-2">{user.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              {sportLabel && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{sportLabel}</span>}
              {levelLabel && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{levelLabel}</span>}
              {user?.city && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">📍 {user.city}</span>}
              {user?.is_looking_for_team && <span className="text-xs bg-yellow-400/80 text-yellow-900 px-2 py-0.5 rounded-full font-medium">Ищу тиммейтов</span>}
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold">{user?.total_bookings}</div>
            <div className="text-xs text-green-100">Бронирований</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Star size={18} className="fill-yellow-300 text-yellow-300" />
              {Number(user?.rating).toFixed(1)}
            </div>
            <div className="text-xs text-green-100">Рейтинг</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{bookings?.count || 0}</div>
            <div className="text-xs text-green-100">Активных броней</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Табы редактирования */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab('edit')}
                className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'edit' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Edit3 size={15} /> Редактировать
              </button>
              <button
                onClick={() => setTab('password')}
                className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'password' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Lock size={15} /> Пароль
              </button>
            </div>
            <div className="p-5">
              {tab === 'edit'
                ? <EditProfileForm user={user} onSuccess={() => { queryClient.invalidateQueries(['me']); fetchMe() }} />
                : <ChangePasswordForm />
              }
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Быстрые ссылки</h2>
            <div className="space-y-1">
              <Link to="/my-bookings" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <span className="flex items-center gap-2"><Calendar size={15} className="text-green-600" /> Мои бронирования</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>
              <Link to="/venues/my" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <span className="flex items-center gap-2"><Trophy size={15} className="text-green-600" /> Мои площадки</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>
              <Link to="/teammates" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <span className="flex items-center gap-2"><User size={15} className="text-green-600" /> Поиск тиммейтов</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>
            </div>
          </div>

          {bookings?.results?.slice(0, 3).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Последние брони</h2>
              <div className="space-y-2">
                {bookings.results.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-32">{b.venue_detail?.name}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">{b.date}</span>
                  </div>
                ))}
              </div>
              <Link to="/my-bookings" className="block text-xs text-green-600 font-medium mt-3 hover:underline">
                Все бронирования →
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          transition: all 0.15s;
        }
        .input-field:focus {
          outline: none;
          ring: 2px;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
      `}</style>
    </div>
  )
}
