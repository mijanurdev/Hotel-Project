import { useState } from 'react'
import { createGuest } from '../api/guests.js'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  nationality: '',
  idNumber: ''
}

export default function GuestForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await createGuest(form)
      setForm(emptyForm)
      setMessage('Guest saved')
      onCreated()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>New Guest</h2>
      <form onSubmit={handleSubmit}>
        <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
        <input className="input" name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
        <input className="input" name="address" value={form.address} onChange={handleChange} placeholder="Address" />
        <input className="input" name="nationality" value={form.nationality} onChange={handleChange} placeholder="Nationality" />
        <input className="input" name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="ID Number" required />
        <button className="btn" type="submit">Save Guest</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
