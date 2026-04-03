import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import '../App.css'
import { getMenuItems, resolveMenuImageUrl } from '../services/menu'
import { createOrder } from '../services/orders'

function PublicMenuPage() {
  const { restaurantId, tableNumber: tableNumberParam } = useParams()
  const [searchParams] = useSearchParams()
  const [menuItems, setMenuItems] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const tableNumber = tableNumberParam || searchParams.get('table')

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await getMenuItems({ restaurant: restaurantId, available: true })
        setMenuItems(response)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadMenu()
  }, [restaurantId])

  const groupedMenu = menuItems.reduce((groups, item) => {
    const key = item.category || 'Chef Specials'
    groups[key] = groups[key] || []
    groups[key].push(item)
    return groups
  }, {})

  const restaurant = menuItems[0]?.restaurant
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = (item) => {
    setSuccessMessage('')
    setCartItems((current) => {
      const existingItem = current.find((cartItem) => cartItem._id === item._id)

      if (existingItem) {
        return current.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [
        ...current,
        {
          _id: item._id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
          type: item.type,
        },
      ]
    })
  }

  const updateCartQuantity = (id, nextQuantity) => {
    if (nextQuantity <= 0) {
      setCartItems((current) => current.filter((item) => item._id !== id))
      return
    }

    setCartItems((current) =>
      current.map((item) => (item._id === id ? { ...item, quantity: nextQuantity } : item)),
    )
  }

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      setError('Add at least one menu item to place an order.')
      return
    }

    if (!tableNumber) {
      setError('This order link does not include a table number. Open the menu using a table QR code.')
      return
    }

    setIsSubmittingOrder(true)
    setError('')
    setSuccessMessage('')

    try {
      await createOrder({
        restaurant: restaurantId,
        tableNumber: Number(tableNumber),
        qrCodeValue: `${restaurantId}-${tableNumber}`,
        customerName: customerName.trim() || 'Guest',
        items: cartItems.map((item) => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          itemType: item.type || 'none',
        })),
        subtotal,
        taxAmount: 0,
        serviceCharge: 0,
        totalAmount: subtotal,
        specialInstructions: specialInstructions.trim(),
      })

      setCartItems([])
      setCustomerName('')
      setSpecialInstructions('')
      setSuccessMessage('Order placed successfully. The restaurant dashboard will now show your order.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <main className="menu-page-shell">
      <section className="menu-page-hero">
        <div>
          <p className="eyebrow">Restaurant Menu</p>
          <h1>{restaurant?.name || 'Menu Preview'}</h1>
          <p className="hero-copy">
            Browse the live menu configured in the dashboard. Only currently available dishes are shown here.
          </p>
          {tableNumber ? <p className="menu-table-chip">Serving table {tableNumber}</p> : null}
        </div>
        <div className="menu-page-meta">
          <div>
            <span className="meta-label">Address</span>
            <strong>{restaurant?.address || 'Restaurant details unavailable'}</strong>
          </div>
          <div>
            <span className="meta-label">Contact</span>
            <strong>{restaurant?.phone || restaurant?.email || 'No contact info'}</strong>
          </div>
          <Link className="ghost-button menu-route-back" to="/login">
            Owner Login
          </Link>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      {isLoading ? <p>Loading menu...</p> : null}
      {!isLoading && !error && menuItems.length === 0 ? (
        <section className="empty-card menu-empty-card">
          <p>No menu items are available for this restaurant yet.</p>
        </section>
      ) : null}

      <section className="guest-order-layout">
        <section className="menu-category-list">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <article className="menu-category-card" key={category}>
              <div className="column-head">
                <div>
                  <p className="column-kicker">Category</p>
                  <h2>{category}</h2>
                </div>
                <strong>{items.length} items</strong>
              </div>

              <div className="menu-item-grid">
                {items.map((item) => (
                  <article className="menu-item-card" key={item._id}>
                    {item.image ? (
                      <img alt={item.name} className="menu-item-image" src={resolveMenuImageUrl(item.image)} />
                    ) : null}
                    <div className="menu-item-copy">
                      <div className="menu-item-head">
                        <h3>{item.name}</h3>
                        <strong>Rs. {Number(item.price).toFixed(2)}</strong>
                      </div>
                      <p>{item.description || 'Prepared fresh for your table.'}</p>
                      <div className="menu-tag-row">
                        <span>{item.type}</span>
                        <span>{item.spiceLevel}</span>
                        <span>{item.preparationTime || 0} min</span>
                      </div>
                      <button className="primary-button" onClick={() => addToCart(item)} type="button">
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-panel">
          <div className="column-head">
            <div>
              <p className="column-kicker">Your cart</p>
              <h2>Place order</h2>
            </div>
            <strong>{cartItems.length} items</strong>
          </div>

          <div className="cart-form">
            <label>
              Customer name
              <input
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Enter your name"
                value={customerName}
              />
            </label>
            <label>
              Special instructions
              <textarea
                onChange={(event) => setSpecialInstructions(event.target.value)}
                placeholder="Less spicy, no onions, extra sauce"
                rows="3"
                value={specialInstructions}
              />
            </label>
          </div>

          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item._id}>
                <div className="menu-item-head">
                  <h3>{item.name}</h3>
                  <strong>Rs. {(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                <div className="cart-item-row">
                  <span>Rs. {item.price.toFixed(2)} each</span>
                  <div className="quantity-controls">
                    <button className="state-button" onClick={() => updateCartQuantity(item._id, item.quantity - 1)} type="button">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button className="state-button" onClick={() => updateCartQuantity(item._id, item.quantity + 1)} type="button">
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {cartItems.length === 0 ? (
              <div className="empty-card">
                <p>Add menu items to start your order.</p>
              </div>
            ) : null}
          </div>

          <div className="cart-summary">
            <div className="cart-item-row">
              <span>Table</span>
              <strong>{tableNumber || 'Not set'}</strong>
            </div>
            <div className="cart-item-row">
              <span>Subtotal</span>
              <strong>Rs. {subtotal.toFixed(2)}</strong>
            </div>
            <button className="primary-button" disabled={isSubmittingOrder || cartItems.length === 0} onClick={handlePlaceOrder} type="button">
              {isSubmittingOrder ? 'Placing order...' : 'Order now'}
            </button>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default PublicMenuPage
