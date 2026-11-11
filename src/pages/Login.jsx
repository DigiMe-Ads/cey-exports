import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, MailCheck, UserPlus } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const field = 'w-full rounded-2xl bg-white/90 px-4 py-3 text-sm outline-none ring-1 ring-forest-100 focus:ring-2 focus:ring-gold'

function AuthShell({ title, accent, subtitle, children }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-10 md:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-[2rem] bg-forest-800 p-8 text-cream md:block">
        <img src="/cey/aerial.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="rings pointer-events-none absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between">
          <Logo light />
          <div>
            <p className="font-serif text-3xl leading-snug">Plan a container. <strong className="font-bold text-gold">Send an inquiry.</strong> Track every step.</p>
            <ul className="mt-5 space-y-2 text-sm text-cream/80">
              <li>• See your container fill as you add cartons</li>
              <li>• No payment online — our team contacts you</li>
              <li>• Follow the status of all your inquiries</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-3xl font-medium text-forest-800">{title} <strong className="font-bold text-rust">{accent}</strong></h1>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export function Login() {
  const { signIn, user, ready } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = params.get('next') || '/account'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  if (ready && user) return <Navigate to={next} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await signIn(email, password)
    setBusy(false)
    if (err) return setError(err.message === 'Invalid login credentials' ? 'Wrong email or password.' : err.message)
    navigate(next, { replace: true })
  }

  const forgot = async () => {
    if (!email) return setError('Enter your email first, then click “Forgot password”.')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/#/account` })
    if (err) setError(err.message)
    else setResetSent(true)
  }

  return (
    <AuthShell title="Welcome" accent="back" subtitle="Sign in to send inquiries and follow their status.">
      <form onSubmit={submit} className="space-y-3">
        <input required type="email" autoComplete="email" placeholder="Email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" autoComplete="current-password" placeholder="Password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>}
        {resetSent && <p className="rounded-2xl bg-leaf/15 p-3 text-sm font-semibold text-forest-800">Check your inbox for a reset link.</p>}
        <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-800 font-bold text-cream hover:bg-forest-700 disabled:opacity-60">
          <LogIn className="h-4 w-4 text-gold" /> {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="flex justify-between text-sm">
          <button type="button" onClick={forgot} className="font-semibold text-slate-500 hover:text-forest-800">Forgot password?</button>
          <Link to={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-rust hover:underline">Create an account</Link>
        </div>
      </form>
    </AuthShell>
  )
}

export function Register() {
  const { signUp, user, ready } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = params.get('next') || '/account'
  const [form, setForm] = useState({ full_name: '', company: '', phone: '', country: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (ready && user && !confirm) return <Navigate to={next} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.')
    setBusy(true)
    setError(null)
    const { email, password, ...meta } = form
    const { data, error: err } = await signUp(email, password, meta)
    setBusy(false)
    if (err) return setError(err.message)
    // With email confirmation on, Supabase returns no session until the link is clicked
    if (!data.session) setConfirm(true)
    else navigate(next, { replace: true })
  }

  if (confirm) {
    return (
      <AuthShell title="Check your" accent="inbox" subtitle={`We sent a confirmation link to ${form.email}.`}>
        <div className="text-center">
          <MailCheck className="mx-auto h-14 w-14 text-leaf" />
          <p className="mt-4 text-sm text-slate-600">Click the link in the email to activate your account, then sign in. Your container plan stays saved on this device.</p>
          <Link to={`/login?next=${encodeURIComponent(next)}`} className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Go to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your" accent="account" subtitle="For importers, distributors, wholesalers and retailers.">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="Full name *" className={field} value={form.full_name} onChange={set('full_name')} />
          <input placeholder="Company" className={field} value={form.company} onChange={set('company')} />
          <input placeholder="Phone / WhatsApp" className={field} value={form.phone} onChange={set('phone')} />
          <input placeholder="Country" className={field} value={form.country} onChange={set('country')} />
        </div>
        <input required type="email" autoComplete="email" placeholder="Email *" className={field} value={form.email} onChange={set('email')} />
        <input required type="password" autoComplete="new-password" placeholder="Password (8+ characters) *" className={field} value={form.password} onChange={set('password')} />
        {error && <p className="rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>}
        <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-bold text-forest-900 hover:bg-gold-dark disabled:opacity-60">
          <UserPlus className="h-4 w-4" /> {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-600">Already registered? <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-rust hover:underline">Sign in</Link></p>
      </form>
    </AuthShell>
  )
}
