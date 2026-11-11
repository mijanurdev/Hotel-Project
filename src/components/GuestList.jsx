import { useEffect, useState } from 'react'
import { getGuests, deleteGuest } from '../api/guests.js'

export default function GuestList({ refreshKey }) {
  const [guests, setGuests] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getGuests()
      .then(setGuests)
      .catch((err) => setError(err.message))
  }, [refreshKey])

  async function handleDelete(id) {
    try {
      await deleteGuest(id)
      setGuests(guests.filter((guest) => (guest.guestId || guest.id) !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) {
    return <div className="card"><p className="error">{error}</p></div>
  }

  return (
    <div className="card">
      <h2>Guests</h2>
      {guests.length === 0 && <p className="muted">No guests yet</p>}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>ID Number</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => {
            const id = guest.guestId || guest.id
            return (
              <tr key={id}>
                <td>{guest.name}</td>
                <td>{guest.phone}</td>
                <td>{guest.email}</td>
                <td>{guest.idNumber || guest.id_number}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(id)}>Delete</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
