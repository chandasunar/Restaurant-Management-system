import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PublicMenuPage from './pages/PublicMenuPage'
import SignupPage from './pages/SignupPage'
import VerifyOtpPage from './pages/VerifyOtpPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/menu/:restaurantId" element={<PublicMenuPage />} />
      <Route path="/menu/:restaurantId/table/:tableNumber" element={<PublicMenuPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/menu" element={<DashboardPage initialSection="menu" />} />
        <Route path="/dashboard/profile" element={<DashboardPage initialSection="profile" />} />
        <Route path="/dashboard/qr-codes" element={<DashboardPage initialSection="qr-codes" />} />
      </Route>
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  )
}

export default App
