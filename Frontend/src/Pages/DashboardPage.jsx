import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import OrderColumn from '../components/OrderColumn'
import '../App.css'
import { getRestaurantById, updateRestaurant } from '../services/auth'
import { createMenuItem, getMenuItems, updateMenuItem } from '../services/menu'
import { getOrdersByRestaurant, updateOrderStatus } from '../services/orders'

const ORDER_STATUSES = ['new', 'pending', 'accepted']
const MENU_TYPES = ['veg', 'non-veg', 'none']
const SPICE_LEVELS = ['none', 'mild', 'medium', 'hot']

const NAV_ITEMS = [
  { key: 'orders', label: 'Orders', path: '/dashboard' },
  { key: 'menu', label: 'Menu', path: '/dashboard/menu' },
  { key: 'profile', label: 'Profile', path: '/dashboard/profile' },
  { key: 'qr-codes', label: 'QR Codes', path: '/dashboard/qr-codes' },
]

const createInitialMenuForm = () => ({
  name: '',
  description: '',
  category: '',
  type: 'none',
  price: '',
  isAvailable: 'true',
  preparationTime: '',
  spiceLevel: 'none',
  tags: '',
  image: null,
})

const createProfileForm = (owner) => ({
  name: owner?.name || '',
  address: owner?.address || '',
  email: owner?.email || '',
  phone: owner?.phone || '',
  tables: owner?.tables ?? 0,
})

function DashboardPage({ initialSection = 'orders' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [owner, setOwner] = useState(() => JSON.parse(localStorage.getItem('rms-owner-session') || 'null'))
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [error, setError] = useState('')
  const [menuMessage, setMenuMessage] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuLoading, setIsMenuLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSavingMenu, setIsSavingMenu] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [editingMenuId, setEditingMenuId] = useState('')
  const [menuForm, setMenuForm] = useState(createInitialMenuForm)
  const [profileForm, setProfileForm] = useState(() => createProfileForm(owner))

  const activeSection = location.pathname === '/dashboard'
    ? 'orders'
    : location.pathname.split('/').at(-1) || initialSection

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
  }, [owner?._id])

  useEffect(() => {
    const loadMenu = async () => {
      if (!owner?._id) {
        setIsMenuLoading(false)
        return
      }

      try {
        const response = await getMenuItems({ restaurant: owner._id })
        setMenuItems(response)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsMenuLoading(false)
      }
    }

    loadMenu()
  }, [owner?._id])

  useEffect(() => {
    const loadProfile = async () => {
      if (!owner?._id) {
        setIsProfileLoading(false)
        return
      }

      try {
        const response = await getRestaurantById(owner._id)
        setOwner(response)
        setProfileForm(createProfileForm(response))
        localStorage.setItem('rms-owner-session', JSON.stringify(response))
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsProfileLoading(false)
      }
    }

    loadProfile()
  }, [owner?._id])

  const groupedOrders = ORDER_STATUSES.map((status) => ({
    status,
    label: status === 'new' ? 'New Orders' : status === 'pending' ? 'Pending Prep' : 'Accepted',
    orders: orders.filter((order) => order.status === status),
  }))

  const qrTables = useMemo(() => {
    const tableCount = Number(owner?.tables || 0)

    return Array.from({ length: tableCount }, (_, index) => {
      const tableNumber = index + 1
      const menuUrl = `${window.location.origin}/menu/${owner?._id}/table/${tableNumber}`
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(menuUrl)}`

      return {
        tableNumber,
        menuUrl,
        qrImageUrl,
      }
    })
  }, [owner?._id, owner?.tables])

  const handleMove = async (id, status) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status)
      setOrders((current) => current.map((order) => (order._id === id ? updatedOrder : order)))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleMenuFieldChange = (event) => {
    const { name, value, files } = event.target

    setMenuForm((current) => ({
      ...current,
      [name]: name === 'image' ? files?.[0] || null : value,
    }))
  }

  const handleProfileFieldChange = ({ target }) => {
    setProfileForm((current) => ({
      ...current,
      [target.name]: target.value,
    }))
  }

  const resetMenuForm = () => {
    setEditingMenuId('')
    setMenuForm(createInitialMenuForm())
  }

  const startEditMenuItem = (item) => {
    setEditingMenuId(item._id)
    setMenuMessage('')
    setError('')
    setMenuForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      type: item.type || 'none',
      price: item.price ?? '',
      isAvailable: String(item.isAvailable),
      preparationTime: item.preparationTime ?? '',
      spiceLevel: item.spiceLevel || 'none',
      tags: item.tags?.join(', ') || '',
      image: null,
    })
  }

  const handleMenuSubmit = async (event) => {
    event.preventDefault()
    setIsSavingMenu(true)
    setError('')
    setMenuMessage('')

    const payload = {
      restaurant: owner?._id,
      name: menuForm.name,
      description: menuForm.description,
      category: menuForm.category,
      type: menuForm.type,
      price: menuForm.price,
      isAvailable: menuForm.isAvailable,
      preparationTime: menuForm.preparationTime,
      spiceLevel: menuForm.spiceLevel,
      tags: menuForm.tags,
      image: menuForm.image,
    }

    try {
      const savedMenuItem = editingMenuId
        ? await updateMenuItem(editingMenuId, payload)
        : await createMenuItem(payload)

      setMenuItems((current) => {
        const nextItems = editingMenuId
          ? current.map((item) => (item._id === editingMenuId ? savedMenuItem : item))
          : [...current, savedMenuItem]

        return [...nextItems].sort((left, right) => {
          const categoryCompare = left.category.localeCompare(right.category)
          return categoryCompare !== 0 ? categoryCompare : left.name.localeCompare(right.name)
        })
      })

      setMenuMessage(editingMenuId ? 'Menu item updated.' : 'Menu item added.')
      resetMenuForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSavingMenu(false)
    }
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setIsSavingProfile(true)
    setError('')
    setProfileMessage('')

    try {
      const updatedRestaurant = await updateRestaurant(owner._id, {
        ...profileForm,
        tables: Number(profileForm.tables || 0),
      })

      setOwner(updatedRestaurant)
      setProfileForm(createProfileForm(updatedRestaurant))
      setProfileMessage('Restaurant profile updated.')
      localStorage.setItem('rms-owner-session', JSON.stringify(updatedRestaurant))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('rms-owner-session')
    navigate('/login')
  }

  const menuRoute = owner?._id ? `/menu/${owner._id}` : '/menu/restaurant'

  return (
    <main className="workspace-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <p className="eyebrow">Restaurant OS</p>
          <h2>{owner?.name || 'Owner Dashboard'}</h2>
          <p className="sidebar-copy">Manage orders, menu, profile details, and table QR access from one workspace.</p>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
              key={item.key}
              to={item.path}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="meta-label">Public menu</span>
          <strong>{menuRoute}</strong>
          <Link className="ghost-button dashboard-link-button" to={menuRoute}>
            Open menu
          </Link>
        </div>

        <div className="sidebar-card">
          <span className="meta-label">Verification</span>
          <strong>{owner?.isVerified ? 'Verified owner' : 'Pending verification'}</strong>
          <span className="sidebar-subtle">{owner?.email}</span>
        </div>

        <button className="ghost-button sidebar-logout" onClick={logout} type="button">
          Logout
        </button>
      </aside>

      <section className="dashboard-content">
        <section className="dashboard-hero dashboard-hero-panel">
          <div>
            <p className="eyebrow">Owner workspace</p>
            <h1>{activeSection === 'orders' ? 'Service flow for dine-in tables' : activeSection === 'menu' ? 'Menu management' : activeSection === 'profile' ? 'Restaurant profile' : 'Table QR codes'}</h1>
            <p className="hero-copy">
              {activeSection === 'orders'
                ? 'Track live table orders and move them from new requests to kitchen prep and accepted service.'
                : activeSection === 'menu'
                  ? 'Create and update dishes that appear on your live restaurant menu.'
                  : activeSection === 'profile'
                    ? 'Keep restaurant contact details and table count accurate so operations and QR access stay in sync.'
                    : 'Generate QR entry points for every table so guests land directly on the right menu.'}
            </p>
          </div>
          <div className="hero-meta">
            <div>
              <span className="meta-label">Restaurant</span>
              <strong>{owner?.name || 'Unavailable'}</strong>
            </div>
            <div>
              <span className="meta-label">Tables</span>
              <strong>{owner?.tables ?? 0}</strong>
            </div>
            <div>
              <span className="meta-label">Menu items</span>
              <strong>{menuItems.length}</strong>
            </div>
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
            <span>QR Tables</span>
            <strong>{owner?.tables ?? 0}</strong>
          </article>
        </section>

        {error ? <p className="error-text">{error}</p> : null}

        {activeSection === 'orders' ? (
          <>
            {isLoading ? <p>Loading orders...</p> : null}
            <section className="section-header">
              <div>
                <p className="eyebrow">Order Board</p>
                <h2>Kitchen and service pipeline</h2>
              </div>
              <p className="board-note">Orders are loaded using the current restaurant account id.</p>
            </section>
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
          </>
        ) : null}

        {activeSection === 'menu' ? (
          <section className="menu-admin-layout">
            <article className="menu-editor-card">
              <div className="column-head">
                <div>
                  <p className="column-kicker">{editingMenuId ? 'Update item' : 'Add item'}</p>
                  <h3>{editingMenuId ? 'Edit menu item' : 'Create a new menu item'}</h3>
                </div>
                {editingMenuId ? (
                  <button className="ghost-button" onClick={resetMenuForm} type="button">
                    Cancel edit
                  </button>
                ) : null}
              </div>

              {menuMessage ? <p className="success-text">{menuMessage}</p> : null}

              <form className="menu-form" onSubmit={handleMenuSubmit}>
                <label>
                  Item name
                  <input name="name" onChange={handleMenuFieldChange} required value={menuForm.name} />
                </label>
                <label>
                  Category
                  <input name="category" onChange={handleMenuFieldChange} required value={menuForm.category} />
                </label>
                <label className="menu-form-span">
                  Description
                  <textarea name="description" onChange={handleMenuFieldChange} rows="4" value={menuForm.description} />
                </label>
                <label>
                  Price
                  <input min="0" name="price" onChange={handleMenuFieldChange} required step="0.01" type="number" value={menuForm.price} />
                </label>
                <label>
                  Preparation time
                  <input min="0" name="preparationTime" onChange={handleMenuFieldChange} step="1" type="number" value={menuForm.preparationTime} />
                </label>
                <label>
                  Type
                  <select name="type" onChange={handleMenuFieldChange} value={menuForm.type}>
                    {MENU_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Spice level
                  <select name="spiceLevel" onChange={handleMenuFieldChange} value={menuForm.spiceLevel}>
                    {SPICE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Availability
                  <select name="isAvailable" onChange={handleMenuFieldChange} value={menuForm.isAvailable}>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </label>
                <label className="menu-form-span">
                  Tags
                  <input name="tags" onChange={handleMenuFieldChange} placeholder="spicy, bestseller, chef special" value={menuForm.tags} />
                </label>
                <label className="menu-form-span">
                  Image
                  <input accept="image/*" name="image" onChange={handleMenuFieldChange} type="file" />
                </label>
                <button className="primary-button menu-form-span" disabled={isSavingMenu} type="submit">
                  {isSavingMenu ? 'Saving...' : editingMenuId ? 'Update menu item' : 'Add menu item'}
                </button>
              </form>
            </article>

            <article className="menu-list-card">
              <div className="column-head">
                <div>
                  <p className="column-kicker">Live menu</p>
                  <h3>Current items</h3>
                </div>
                <strong>{menuItems.length}</strong>
              </div>

              {isMenuLoading ? <p>Loading menu items...</p> : null}
              {!isMenuLoading && menuItems.length === 0 ? (
                <div className="empty-card">
                  <p>No menu items yet. Add your first item from the form.</p>
                </div>
              ) : null}

              <div className="menu-admin-list">
                {menuItems.map((item) => (
                  <article className="menu-admin-item" key={item._id}>
                    <div className="menu-admin-copy">
                      <div className="menu-item-head">
                        <h3>{item.name}</h3>
                        <strong>Rs. {Number(item.price).toFixed(2)}</strong>
                      </div>
                      <p>{item.description || 'No description added yet.'}</p>
                      <div className="menu-tag-row">
                        <span>{item.category}</span>
                        <span>{item.type}</span>
                        <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                      </div>
                    </div>
                    <button className="ghost-button" onClick={() => startEditMenuItem(item)} type="button">
                      Edit
                    </button>
                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {activeSection === 'profile' ? (
          <section className="profile-layout">
            <article className="profile-card">
              <div className="section-header compact">
                <div>
                  <p className="eyebrow">Profile settings</p>
                  <h2>Restaurant details</h2>
                </div>
              </div>

              {profileMessage ? <p className="success-text">{profileMessage}</p> : null}
              {isProfileLoading ? <p>Loading profile...</p> : null}

              <form className="menu-form" onSubmit={handleProfileSubmit}>
                <label>
                  Restaurant name
                  <input name="name" onChange={handleProfileFieldChange} required value={profileForm.name} />
                </label>
                <label>
                  Phone
                  <input name="phone" onChange={handleProfileFieldChange} required value={profileForm.phone} />
                </label>
                <label className="menu-form-span">
                  Address
                  <textarea name="address" onChange={handleProfileFieldChange} required rows="4" value={profileForm.address} />
                </label>
                <label>
                  Email
                  <input name="email" onChange={handleProfileFieldChange} required type="email" value={profileForm.email} />
                </label>
                <label>
                  Total tables
                  <input min="0" name="tables" onChange={handleProfileFieldChange} required type="number" value={profileForm.tables} />
                </label>
                <button className="primary-button menu-form-span" disabled={isSavingProfile} type="submit">
                  {isSavingProfile ? 'Saving profile...' : 'Save profile'}
                </button>
              </form>
            </article>

            <article className="profile-summary-card">
              <p className="column-kicker">Operations summary</p>
              <h3>What this controls</h3>
              <div className="summary-grid">
                <div>
                  <span className="meta-label">Tables configured</span>
                  <strong>{owner?.tables ?? 0}</strong>
                </div>
                <div>
                  <span className="meta-label">QR cards generated</span>
                  <strong>{qrTables.length}</strong>
                </div>
                <div>
                  <span className="meta-label">Current menu URL</span>
                  <strong className="break-line">{`${window.location.origin}${menuRoute}`}</strong>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        {activeSection === 'qr-codes' ? (
          <section className="qr-layout">
            <section className="section-header">
              <div>
                <p className="eyebrow">Guest access</p>
                <h2>QR codes for every table</h2>
              </div>
              <p className="board-note">Each QR code opens the live menu with a table number attached in the URL.</p>
            </section>

            {qrTables.length === 0 ? (
              <article className="empty-card menu-empty-card">
                <p>Add table count in the profile section before generating QR codes.</p>
              </article>
            ) : (
              <section className="qr-grid">
                {qrTables.map((table) => (
                  <article className="qr-card" key={table.tableNumber}>
                    <div className="qr-card-head">
                      <div>
                        <p className="column-kicker">Table {table.tableNumber}</p>
                        <h3>Scan to open menu</h3>
                      </div>
                      <span className="qr-badge">Live</span>
                    </div>
                    <img
                      alt={`QR code for table ${table.tableNumber}`}
                      className="qr-image"
                      src={table.qrImageUrl}
                    />
                    <div className="qr-actions">
                      <a className="ghost-button dashboard-link-button" href={table.menuUrl} rel="noreferrer" target="_blank">
                        Open link
                      </a>
                      <a className="primary-button dashboard-link-button" download={`table-${table.tableNumber}-qr.png`} href={table.qrImageUrl}>
                        Download QR
                      </a>
                    </div>
                    <p className="qr-url">{table.menuUrl}</p>
                  </article>
                ))}
              </section>
            )}
          </section>
        ) : null}
      </section>
    </main>
  )
}

export default DashboardPage
