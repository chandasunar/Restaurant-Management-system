import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { resendOtp, verifyOtp } from '../services/auth'

function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = useMemo(() => searchParams.get('email') || '', [searchParams])
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const restaurant = await verifyOtp({ email, otp })
      localStorage.setItem('rms-owner-session', JSON.stringify(restaurant))
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)

    try {
      const response = await resendOtp({ email })
      setSuccess(response.message || 'OTP resent successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell
      mode="Email verification"
      title="Enter the OTP sent to your email"
      subtitle={email ? `Complete verification for ${email}.` : 'Complete email verification to activate the owner account.'}
    >
      <form className="auth-form" onSubmit={handleVerify}>
        <label>
          Email
          <input value={email} readOnly type="email" />
        </label>
        <label>
          OTP
          <input maxLength="6" onChange={(event) => setOtp(event.target.value)} required value={otp} />
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">{success}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Verifying...' : 'Verify account'}
        </button>
        <button className="ghost-button" disabled={isResending || !email} onClick={handleResend} type="button">
          {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
      </form>
    </AuthShell>
  )
}

export default VerifyOtpPage
