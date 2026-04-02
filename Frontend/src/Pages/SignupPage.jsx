import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { registerRestaurant } from '../services/auth'

const initialForm = {
  name: '',
  address: '',
  email: '',
  phone: '',
  tables: '',
  password: '',
}

function SignupPage() {
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
      await registerRestaurant({
        ...form,
        tables: Number(form.tables || 0),
      })

      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      mode="Restaurant onboarding"
      title="Create owner account"
      subtitle="Register the restaurant, then verify the email with the OTP we send before login is allowed."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Restaurant name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </label>
        <label>
          Tables
          <input name="tables" type="number" min="1" value={form.tables} onChange={handleChange} />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <div className="link-row">
          <span>Already created the account?</span>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </AuthShell>
  )
}

export default SignupPage
