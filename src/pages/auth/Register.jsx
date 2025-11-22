import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../lib/firebase'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { validatePassword } from '../../utils/validators'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    const v = validatePassword(password)
    if(!v.ok){
      return Swal.fire('Invalid','Password must be min 6 chars and contain both uppercase & lowercase letters','error')
    }

    setLoading(true)
    try{
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCred.user, { displayName: name, photoURL: photoURL || null })
      Swal.fire('Success','Registration successful','success')
      navigate('/', { replace: true })
    }catch(err){
      console.error(err)
      Swal.fire('Error', err.message || 'Registration failed','error')
    }
    setLoading(false)
  }

  async function handleGoogle(){
    setLoading(true)
    try{
      await signInWithPopup(auth, googleProvider)
      Swal.fire('Success','Signed up with Google','success')
      navigate('/', { replace: true })
    }catch(err){
      console.error(err)
      Swal.fire('Error','Google signup failed','error')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" className="w-full p-2 border rounded" />
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={photoURL} onChange={e=>setPhotoURL(e.target.value)} placeholder="Photo URL (optional)" className="w-full p-2 border rounded" />
        <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded" />
        <button disabled={loading} className="w-full px-4 py-2 bg-purple-600 text-white rounded">{loading? 'Registering...' : 'Register'}</button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={handleGoogle} className="px-4 py-2 border rounded">Continue with Google</button>
      </div>

      <div className="mt-4 text-sm text-center">
        Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
      </div>
    </div>
  )
}

