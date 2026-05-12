import { Link } from 'react-router-dom'
import { Search, MapPin, Users, Star, ArrowRight } from 'lucide-react'

const SPORTS = [
  { key: 'football', label: 'Футбол', icon: '⚽' },
  { key: 'basketball', label: 'Баскетбол', icon: '🏀' },
  { key: 'volleyball', label: 'Волейбол', icon: '🏐' },
  { key: 'tennis', label: 'Теннис', icon: '🎾' },
  { key: 'badminton', label: 'Бадминтон', icon: '🏸' },
  { key: 'hockey', label: 'Хоккей', icon: '🏒' },
]

export default function HomePage() {
  return (
    <div className="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Бронируй площадки.<br />Находи тиммейтов.
          </h1>
          <p className="text-green-100 text-lg mb-10">
            Все спортивные площадки города в одном месте. Выбирай время, бронируй онлайн и играй!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/venues" className="bg-white text-green-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
              <Search size={18} />
              Найти площадку
            </Link>
            <Link to="/teammates" className="bg-green-500/30 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-green-500/50 transition-colors flex items-center justify-center gap-2">
              <Users size={18} />
              Найти тиммейта
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Виды спорта */}
        <section className="py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Выбери вид спорта</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SPORTS.map((sport) => (
              <Link
                key={sport.key}
                to={`/venues?sport_type=${sport.key}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-green-300 border border-gray-100 transition-all group"
              >
                <div className="text-3xl mb-2">{sport.icon}</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-green-600">{sport.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Преимущества */}
        <section className="py-10 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Удобный поиск</h3>
              <p className="text-gray-500 text-sm">Фильтруй по виду спорта, городу, цене и удобствам</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Карта площадок</h3>
              <p className="text-gray-500 text-sm">Смотри расположение всех площадок на карте</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Поиск тиммейтов</h3>
              <p className="text-gray-500 text-sm">Находи игроков своего уровня для совместной игры</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Готов играть?</h2>
            <p className="text-green-100 mb-6">Зарегистрируйся и бронируй первую площадку бесплатно</p>
            <Link to="/register" className="bg-white text-green-700 font-semibold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors inline-flex items-center gap-2">
              Начать <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
