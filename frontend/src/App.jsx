import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VenuesPage from './pages/VenuesPage'
import VenueDetailPage from './pages/VenueDetailPage'
import MyBookingsPage from './pages/MyBookingsPage'
import TeammatesPage from './pages/TeammatesPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { fetchMe, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) fetchMe()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/venues" element={<Layout><VenuesPage /></Layout>} />
      <Route path="/venues/:id" element={<Layout><VenueDetailPage /></Layout>} />
      <Route path="/teammates" element={<Layout><TeammatesPage /></Layout>} />
      <Route path="/my-bookings" element={<PrivateRoute><Layout><MyBookingsPage /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
