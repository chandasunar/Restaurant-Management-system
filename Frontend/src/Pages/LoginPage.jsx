import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { loginRestaurant } from '../services/auth'

const initialForm = {
  email: '',
  password: '',
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      [target.name]: target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await loginRestaurant(form)
      localStorage.setItem('rms-owner-session', JSON.stringify(response))
      navigate('/dashboard')
    } catch (requestError) {
      if (requestError.requiresVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`)
        return
      }

      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      mode="Owner access"
      title="Login to restaurant dashboard"
      subtitle="Only verified restaurant owners can enter the dashboard."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Checking access...' : 'Open dashboard'}
        </button>

        <div className="link-row">
          <span>Need a new restaurant account?</span>
          <Link to="/signup">Sign up</Link>
        </div>
      </form>
    </AuthShell>
  )
}

export default LoginPage
