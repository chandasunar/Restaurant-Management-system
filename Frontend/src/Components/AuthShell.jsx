import { NavLink } from 'react-router-dom'
import '../App.css'

function AuthShell({ mode, title, subtitle, children }) {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Dine-In Command Center</p>
        <h1>Run your floor from the first scan to the last plate.</h1>
        <p className="hero-copy">
          Restaurants onboard here, publish menus, verify owner access, and manage QR-based table orders from one dashboard.
        </p>

        <div className="feature-ribbon">
          <span>QR table flow</span>
          <span>Email verification</span>
          <span>Owner dashboard</span>
        </div>

        <div className="preview-card">
          <div className="preview-row">
            <span>Table 12</span>
            <strong>New request</strong>
          </div>
          <div className="preview-row">
            <span>2x Truffle Kulcha</span>
            <span>Rs. 460</span>
          </div>
          <div className="preview-row muted">
            <span>Verify owner access before dashboard login.</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="tab-row">
          <NavLink className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')} to="/signup">
            Sign up
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')} to="/login">
            Login
          </NavLink>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <p className="eyebrow">{mode}</p>
          <h2>{title}</h2>
          <p style={{ color: 'var(--text)', marginTop: '10px' }}>{subtitle}</p>
        </div>

        {children}
      </section>
    </main>
  )
}

export default AuthShell
