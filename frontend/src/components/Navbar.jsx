import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { MapPin, Calendar, Users, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BookingYeah</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/venues" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
              <MapPin size={16} />
              Площадки
            </Link>
            <Link to="/teammates" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
              <Users size={16} />
              Тиммейты
            </Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
                <Calendar size={16} />
                Мои брони
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-green-600" />
                  </div>
                  <span className="hidden md:block font-medium">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Выйти">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
                  Войти
                </Link>
                <Link to="/register" className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
