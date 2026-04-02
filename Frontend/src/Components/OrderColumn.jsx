import '../App.css'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function OrderColumn({ status, label, orders, statuses, onMove }) {
  return (
    <article className="order-column">
      <div className="column-head">
        <div>
          <p className="column-kicker">{status}</p>
          <h3>{label}</h3>
        </div>
        <span className="order-badge">{orders.length}</span>
      </div>

      <div className="card-stack">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-row">
              <strong>{order.customerName || 'Guest'}</strong>
              <span>Table {order.tableNumber}</span>
            </div>
            <div className="order-row emphasis">
              <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <ul className="item-list">
              {order.items.map((item) => (
                <li key={`${order._id}-${item.name}`}>{item.quantity}x {item.name}</li>
              ))}
            </ul>
            <div className="action-row">
              {statuses.filter((nextStatus) => nextStatus !== order.status).map((nextStatus) => (
                <button
                  className="state-button"
                  key={nextStatus}
                  onClick={() => onMove(order._id, nextStatus)}
                >
                  Move to {nextStatus}
                </button>
              ))}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="empty-card">
            <p>No orders in {status}.</p>
          </div>
        )}
      </div>
    </article>
  )
}

export default OrderColumn
