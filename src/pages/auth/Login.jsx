import { useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../lib/firebase'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  async function handleEmailLogin(e){
    e.preventDefault()
    setLoading(true)
    try{
      await signInWithEmailAndPassword(auth, email, password)
      Swal.fire('Success','Logged in successfully','success')
      navigate(redirectTo, { replace: true })
    }catch(err){
      console.error(err)
      Swal.fire('Error', err.message || 'Login failed', 'error')
    }
    setLoading(false)
  }

  async function handleGoogle(){
    setLoading(true)
    try{
      await signInWithPopup(auth, googleProvider)
      Swal.fire('Success','Logged in with Google','success')
      navigate(redirectTo, { replace: true })
    }catch(err){
      console.error(err)
      Swal.fire('Error', err.message || 'Google login failed', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded" />
        <button disabled={loading} className="w-full px-4 py-2 bg-purple-600 text-white rounded">{loading? 'Logging...' : 'Login'}</button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={handleGoogle} className="px-4 py-2 border rounded">Continue with Google</button>
      </div>

      <div className="mt-4 text-sm text-center">
        Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
      </div>
    </div>
  )
}

