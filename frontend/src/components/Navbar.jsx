import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { MapPin, Calendar, Users, LogOut, User, Map, Trophy, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (path) => location.pathname === path

  const navLink = (to, icon, label) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-1 py-0.5 ${
        isActive(to) ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
      }`}
    >
      {icon}
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Лого */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BookingYeah</span>
          </Link>

          {/* Навигация */}
          <div className="hidden md:flex items-center gap-5">
            {navLink('/venues', <MapPin size={15} />, 'Площадки')}
            {navLink('/map', <Map size={15} />, 'Карта')}
            {navLink('/teammates', <Users size={15} />, 'Тиммейты')}
            {isAuthenticated && navLink('/my-bookings', <Calendar size={15} />, 'Мои брони')}
            {isAuthenticated && navLink('/venues/my', <Trophy size={15} />, 'Мои площадки')}
          </div>

          {/* Пользователь */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : <User size={16} className="text-green-600" />
                    }
                  </div>
                  <span className="hidden md:block font-medium max-w-24 truncate">{user?.username}</span>
                  <ChevronDown size={14} className={`hidden md:block transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={15} className="text-gray-400" /> Профиль
                    </Link>
                    <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Calendar size={15} className="text-gray-400" /> Мои брони
                    </Link>
                    <Link to="/venues/my" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Trophy size={15} className="text-gray-400" /> Мои площадки
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={15} /> Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
