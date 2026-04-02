import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  const owner = localStorage.getItem('rms-owner-session')

  if (!owner) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
