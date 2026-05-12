import { Link } from 'react-router-dom'
import { MapPin, Star, Clock } from 'lucide-react'

const SPORT_ICONS = {
  football: '⚽',
  basketball: '🏀',
  volleyball: '🏐',
  tennis: '🎾',
  badminton: '🏸',
  hockey: '🏒',
  multi: '🏟️',
}

export default function VenueCard({ venue }) {
  return (
    <Link to={`/venues/${venue.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-44 bg-gray-100 relative overflow-hidden">
        {venue.main_photo ? (
          <img src={venue.main_photo} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {SPORT_ICONS[venue.sport_type] || '🏟️'}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700">
          {venue.sport_type_display}
        </span>
        {venue.is_indoor && (
          <span className="absolute top-3 right-3 bg-blue-500/90 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Крытый
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base truncate">{venue.name}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin size={13} />
          <span className="truncate">{venue.city}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {Number(venue.rating).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({venue.total_reviews})</span>
          </div>
          <div className="text-right">
            <span className="text-green-600 font-bold text-base">{venue.price_per_hour} ₸</span>
            <span className="text-gray-400 text-xs">/час</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
