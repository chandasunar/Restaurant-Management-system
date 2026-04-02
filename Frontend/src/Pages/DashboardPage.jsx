import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderColumn from '../components/OrderColumn'
import '../App.css'
import { getOrdersByRestaurant, updateOrderStatus } from '../services/orders'

const ORDER_STATUSES = ['new', 'pending', 'accepted']

function DashboardPage() {
  const navigate = useNavigate()
  const [owner] = useState(() => JSON.parse(localStorage.getItem('rms-owner-session') || 'null'))
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      if (!owner?._id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getOrdersByRestaurant(owner._id)
        setOrders(response)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [owner])

  const handleMove = async (id, status) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status)
      setOrders((current) => current.map((order) => (order._id === id ? updatedOrder : order)))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('rms-owner-session')
    navigate('/login')
  }

  const groupedOrders = ORDER_STATUSES.map((status) => ({
    status,
    label: status === 'new' ? 'New Orders' : status === 'pending' ? 'Pending Prep' : 'Accepted',
    orders: orders.filter((order) => order.status === status),
  }))

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Owner Dashboard</p>
          <h1>{owner?.name || owner?.restaurantName || 'Restaurant dashboard'}</h1>
          <p className="hero-copy">
            Verified owners can review dine-in QR orders here and move them from new requests into kitchen prep and accepted service.
          </p>
        </div>
        <div className="hero-meta">
          <div>
            <span className="meta-label">Verification</span>
            <strong>{owner?.isVerified ? 'Verified' : 'Pending'}</strong>
          </div>
          <div>
            <span className="meta-label">Contact</span>
            <strong>{owner?.email}</strong>
          </div>
          <button className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <span>Live Orders</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="metric-card">
          <span>New Requests</span>
          <strong>{orders.filter((order) => order.status === 'new').length}</strong>
        </article>
        <article className="metric-card">
          <span>Kitchen Queue</span>
          <strong>{orders.filter((order) => order.status === 'pending').length}</strong>
        </article>
        <article className="metric-card">
          <span>Accepted</span>
          <strong>{orders.filter((order) => order.status === 'accepted').length}</strong>
        </article>
      </section>

      <section className="board-header">
        <div>
          <p className="eyebrow">Order Board</p>
          <h2>Service flow for dine-in tables</h2>
        </div>
        <p className="board-note">Orders are loaded from the backend using the restaurant account id.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {isLoading ? <p>Loading orders...</p> : null}

      <section className="orders-board">
        {groupedOrders.map((group) => (
          <OrderColumn
            key={group.status}
            label={group.label}
            onMove={handleMove}
            orders={group.orders}
            status={group.status}
            statuses={ORDER_STATUSES}
          />
        ))}
      </section>
    </main>
  )
}

export default DashboardPage
