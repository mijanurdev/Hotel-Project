import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";

const ICONS = {
  wifi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <path d="M12 20h.01" />
    </svg>
  ),
  pool: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9c1.5 0 1.5-1.5 3-1.5S6.5 9 8 9s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5" />
      <path d="M2 14c1.5 0 1.5-1.5 3-1.5S6.5 14 8 14s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5" />
      <path d="M2 19c1.5 0 1.5-1.5 3-1.5S6.5 19 8 19s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5" />
    </svg>
  ),
  restaurant: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  conference: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  frontdesk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  ),
};

const ROOM_TYPES = [
  { type: "Single", price: 2500, img: "/images/single.jpg", badge: "Best Value", details: "1 Guest · 1 Bed · 180 sq ft · From Room 101", amenities: "Free Wi-Fi · AC · TV · Hot Water · Work Desk", desc: "One comfortable bed, perfect for a solo traveller. Free Wi-Fi, TV and a city view." },
  { type: "Double", price: 4500, img: "/images/double.jpg", badge: "Family Favourite", details: "2 Guests · 1 Double Bed · 320 sq ft · From Room 201", amenities: "Free Wi-Fi · AC · TV · Mini Fridge · City View", desc: "A spacious room with a large bed, sofa and work desk. Ideal for couples or friends." },
  { type: "Deluxe", price: 8500, img: "/images/deluxe.jpg", badge: "Premium", details: "3 Guests · King Bed · 520 sq ft · From Room 301", amenities: "Free Wi-Fi · AC · Sofa Area · Balcony · Free Breakfast", desc: "Our premium room with a garden view, sitting area and extra comfort for a relaxing stay." },
];

const FACILITIES = [
  { icon: "wifi", name: "Free Wi-Fi", desc: "High-speed internet in every room and the lobby" },
  { icon: "pool", name: "Swimming Pool", desc: "Open every day from 7:00 AM to 10:00 PM" },
  { icon: "restaurant", name: "Restaurant", desc: "Local and continental dishes, with 24/7 room service" },
  { icon: "conference", name: "Conference Room", desc: "A 50-guest hall for meetings and events" },
  { icon: "frontdesk", name: "24/7 Front Desk", desc: "Check in any time — help is always one call away" },
  { icon: "parking", name: "Parking", desc: "Safe, secure indoor parking for your car" },
];

const GALLERY = [
  { img: "/images/gallery-1.jpg", title: "Hotel Exterior & Arrival", desc: "Hotel NIVAS at sunset, with palm trees and the pool in front of the building." },
  { img: "/images/gallery-2.jpg", title: "Swimming Pool & Deck", desc: "Relax by the pool in the evening, with the restaurant terrace right beside it." },
  { img: "/images/gallery-3.jpg", title: "Restaurant & Dining", desc: "Our fine dining restaurant serves fresh local and international food every day." },
  { img: "/images/single.jpg", title: "Single Room", desc: "A clean and modern single room with one large bed and a city view." },
  { img: "/images/double.jpg", title: "Double Room", desc: "A bright double room with a large bed, sofa, desk and long windows." },
  { img: "/images/deluxe.jpg", title: "Deluxe Room", desc: "A warm wooden deluxe room with a garden view through large glass doors." },
];

const SERVICES = [
  { name: "Breakfast", price: 500 },
  { name: "Lunch", price: 800 },
  { name: "Laundry", price: 300 },
  { name: "Airport Pickup", price: 1000 },
];

const REVIEWS = [
  { name: "Rahim Uddin", meta: "Dhaka, Bangladesh · Double Room", rating: 5, text: "রুম পরিষ্কার, স্টাফদের ব্যবহার খুব ভালো। অনলাইনে বুক করে এসে কোনো ঝামেলাই হয়নি।" },
  { name: "Sarah Mitchell", meta: "Sydney, Australia · Deluxe Room", rating: 5, text: "The room was spotless and the staff went out of their way to help. Booking online and checking in was completely hassle-free." },
  { name: "Farhana Akter", meta: "Chattogram, Bangladesh · Deluxe Room", rating: 5, text: "ব্রেকফাস্টটা চমৎকার ছিল, পুল এরিয়াটা পরিবার নিয়ে সময় কাটানোর জন্য দারুণ।" },
  { name: "James Carter", meta: "London, United Kingdom · Single Room", rating: 5, text: "Excellent value for money. The pool deck at sunset is beautiful, and breakfast was the best I had on my whole trip." },
  { name: "Tanvir Hasan", meta: "Dhaka, Bangladesh · Single Room", rating: 4, text: "দামের তুলনায় সার্ভিস অনেক ভালো। চেক-আউটের সময় বিল একদম পরিষ্কারভাবে বুঝিয়ে দিয়েছে।" },
  { name: "Emma Wilson", meta: "Toronto, Canada · Double Room", rating: 4, text: "Quiet, clean and very welcoming. The front desk arranged our airport pickup in minutes — I would happily stay again." },
];

function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function nightsBetween(a, b) {
  const days = (new Date(b) - new Date(a)) / 86400000;
  return Number.isFinite(days) && days > 0 ? days : 0;
}

function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function HomePage({ onStaffLogin, dark, onToggleTheme, user, onGoProfile, onGuestUpdated }) {
  const [checkIn, setCheckIn] = useState("2026-11-10");
  const [checkOut, setCheckOut] = useState("2026-11-13");
  const [roomType, setRoomType] = useState("Single");
  const [guests, setGuests] = useState(2);
  const [roomTypes, setRoomTypes] = useState([]);
  const [avail, setAvail] = useState({ searched: false, loading: false, rooms: [], error: "", fallback: false });
  const [booking, setBooking] = useState(null);
  const [pickedServices, setPickedServices] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [bookMsg, setBookMsg] = useState("");
  const [bookErr, setBookErr] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isGuest = user && user.kind === "guest";

  useEffect(() => {
    apiGet("/room-types")
      .then((d) => setRoomTypes(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isGuest) {
      setGuestName(user.name || "");
      setGuestPhone(user.phone || "");
    }
  }, [isGuest, user]);

  function goTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function typePrice(name) {
    const fromDb = roomTypes.find((t) => (t.typeName || "").toLowerCase() === (name || "").toLowerCase());
    if (fromDb) return Number(fromDb.basePrice);
    return (ROOM_TYPES.find((r) => r.type === name) || {}).price || 0;
  }

  function roomTypeIdOf(room) {
    return room.roomTypeId ?? room.roomType?.roomTypeId ?? room.typeId ?? room.roomType?.id ?? null;
  }

  function typeNameOf(room) {
    const direct = room.roomType?.typeName || room.typeName;
    if (direct) return direct;
    const id = roomTypeIdOf(room);
    if (id === null || id === undefined) return null;
    const t = roomTypes.find((x) => String(x.roomTypeId) === String(id));
    return t ? t.typeName : null;
  }

  async function fetchAvailable() {
    setAvail({ searched: true, loading: true, rooms: [], error: "", fallback: false });
    try {
      const data = await apiGet("/rooms/available?checkIn=" + checkIn + "&checkOut=" + checkOut);
      let rooms = Array.isArray(data) ? data : [];
      if (rooms.length > 0) {
        setAvail({ searched: true, loading: false, rooms, error: "", fallback: false });
        return rooms;
      }
      const all = await apiGet("/rooms");
      const list = Array.isArray(all) ? all : [];
      const statuses = await apiGet("/room-statuses").catch(() => []);
      const availIds = new Set((Array.isArray(statuses) ? statuses : []).filter((s) => s.statusName === "Available").map((s) => s.statusId));
      rooms = list.filter((r) => availIds.size === 0 || availIds.has(r.statusId));
      setAvail({ searched: true, loading: false, rooms, error: "", fallback: true });
      return rooms;
    } catch (e) {
      try {
        const all = await apiGet("/rooms");
        const list = Array.isArray(all) ? all : [];
        setAvail({ searched: true, loading: false, rooms: list, error: "", fallback: true });
        return list;
      } catch (e2) {
        setAvail({ searched: true, loading: false, rooms: [], error: "Could not check availability. Is the backend running? " + e.message, fallback: false });
        return [];
      }
    }
  }

  function startBooking(type, price, roomId) {
    setBooking({ type, price, roomId: roomId || null });
    setPickedServices([]);
    setBookMsg("");
    setBookErr("");
    setTimeout(() => document.getElementById("booking-summary")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function bookRoomCard(type) {
    const rooms = await fetchAvailable();
    const match = rooms.find((r) => {
      const name = typeNameOf(r);
      return !name || name.toLowerCase() === type.toLowerCase();
    });
    if (!match) {
      setBookErr("No " + type + " room is available for these dates. Please try other dates.");
      return;
    }
    startBooking(type, typePrice(type), match.roomId);
  }

  function toggleService(name) {
    setPickedServices((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  const nights = nightsBetween(checkIn, checkOut);
  const roomTotal = booking ? nights * booking.price : 0;
  const serviceTotal = pickedServices.reduce((sum, name) => sum + (SERVICES.find((s) => s.name === name)?.price || 0), 0);
  const grandTotal = roomTotal + serviceTotal;

  async function confirmBooking() {
    setBookErr("");
    setBookMsg("");
    if (!booking) return;
    if (!guestName.trim() || !guestPhone.trim()) {
      setBookErr("Please enter your name and phone number.");
      return;
    }
    if (!booking.roomId) {
      setBookErr("Please check availability first to pick a room.");
      return;
    }
    if (nights === 0) {
      setBookErr("Check-out date must be after check-in date.");
      return;
    }
    try {
      let guestId = null;
      if (isGuest && user.guestId) {
        guestId = user.guestId;
      } else {
        const guest = await apiPost("/guests", {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: isGuest ? user.email : undefined,
          idNumber: isGuest ? user.email : guestPhone.trim(),
        });
        guestId = guest.guestId || guest.id;
        if (isGuest && guestId && onGuestUpdated) {
          onGuestUpdated({ ...user, guestId });
        }
      }
      const saved = await apiPost("/bookings", {
        guestId,
        roomId: booking.roomId,
        staffId: 1,
        checkIn,
        checkOut,
        nightlyRate: booking.price,
        status: "BOOKED",
        notes: pickedServices.length ? "Services: " + pickedServices.join(", ") : "",
      });
      setBookMsg("Booking confirmed! Booking ID: " + (saved.bookingId || saved.id || "") + ". Total: ৳" + grandTotal + ".");
    } catch (e) {
      setBookErr("Booking could not be saved. " + e.message + " Please book from the staff dashboard.");
    }
  }

  const shownAvail = avail.rooms.filter((r) => {
    if (roomType === "All") return true;
    const name = typeNameOf(r);
    if (!name) return true;
    return name.toLowerCase() === roomType.toLowerCase();
  });

  return (
    <div>
      <header className="navbar">
        <button className="nav-logo" type="button" onClick={goTop}>
          <img src="/logo.png" alt="Hotel NIVAS logo" />
          Hotel NIVAS
        </button>
        <nav className={"nav-links" + (menuOpen ? " open" : "")}>
          <a className="nav-link" href="#rooms" onClick={() => setMenuOpen(false)}>Rooms</a>
          <a className="nav-link" href="#facilities" onClick={() => setMenuOpen(false)}>Facilities</a>
          <a className="nav-link" href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
          <a className="nav-link" href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a className="nav-link" href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div className="nav-actions">
          <button className="theme-btn" type="button" onClick={onToggleTheme} aria-label="Toggle dark or light theme">
            <span className="theme-icon">{dark ? "☀️" : "🌙"}</span>
            <span className="theme-label">{dark ? " Light" : " Dark"}</span>
          </button>
          {user && user.kind === "guest" ? (
            <button className="avatar-circle" type="button" onClick={onGoProfile} title={user.name + " — My Profile"}>
              {(user.name || "G").trim().charAt(0).toUpperCase()}
            </button>
          ) : (
            <button className="btn btn-primary btn-small" type="button" onClick={user ? onGoProfile : onStaffLogin}>Sign In</button>
          )}
          <button className="hamburger" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>
        </div>
      </header>

      <section className="hero">
        <img className="hero-img" src="/images/hero.jpg" alt="Hotel NIVAS" />
        <div className="hero-overlay" />
        <div className="hero-content fade-up">
          <h1 className="hero-title">Welcome to Hotel NIVAS</h1>
          <p className="hero-subtitle">Comfort, care and a calm stay in the heart of Dhaka, Bangladesh.</p>
          <div className="booking-bar">
            <label className="booking-field">
              Check In
              <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </label>
            <label className="booking-field">
              Check Out
              <input className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </label>
            <label className="booking-field">
              Room Type
              <select className="input" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </label>
            <label className="booking-field">
              Guests
              <input className="input" type="number" min="1" max="6" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </label>
            <button className="btn btn-primary" type="button" onClick={fetchAvailable} disabled={avail.loading}>
              {avail.loading ? "Checking..." : "Check Availability"}
            </button>
          </div>
        </div>
      </section>

      <section className="stats-section fade-up">
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-number">120+</div>
            <div className="stat-label">Comfortable Rooms</div>
          </div>
          <div className="card stat-card">
            <div className="stat-number">15+</div>
            <div className="stat-label">Years of Experience</div>
          </div>
          <div className="card stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Front Desk Support</div>
          </div>
          <div className="card stat-card">
            <div className="stat-number">4.8<span className="star">★</span></div>
            <div className="stat-label">Guest Rating</div>
          </div>
        </div>
      </section>

      {avail.searched && (
        <section className="section fade-up">
          <h2 className="section-title">Available Rooms</h2>
          <p className="section-subtitle">{checkIn} to {checkOut} — {guests} guest(s)</p>
          {avail.error && <div className="error-box">{avail.error}</div>}
          {avail.fallback && shownAvail.length > 0 && (
            <p>Showing rooms marked Available in the system. Please confirm your dates with reception.</p>
          )}
          {!avail.error && shownAvail.length === 0 && (
            <p>No rooms are available for these dates. Please try other dates. Tip: open the Rooms page in the staff dashboard and set the Room Status to Available.</p>
          )}
          <div className="avail-grid">
            {shownAvail.map((room) => (
              <div className="card avail-card" key={room.roomId}>
                <h3>Room {room.roomNumber}</h3>
                <p>{cap(typeNameOf(room)) || "Standard"} Room</p>
                <p className="room-price">৳{typePrice(typeNameOf(room) || "Single")} / night</p>
                <p><span className="badge badge-success">Available</span></p>
                <button className="btn btn-primary" type="button" onClick={() => startBooking(cap(typeNameOf(room)) || "Single", typePrice(typeNameOf(room) || "Single"), room.roomId)}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section" id="rooms">
        <h2 className="section-title">Our Rooms</h2>
        <p className="section-subtitle">Every price comes straight from the room types in the database — Single ৳2,500 · Double ৳4,500 · Deluxe ৳8,500 per night.</p>

        {selectedRoom ? (
          <div className="card room-detail fade-up">
            <img className="room-detail-img" src={selectedRoom.img} alt={selectedRoom.type + " room"} />
            <span className="room-badge">{selectedRoom.badge}</span>
            <h3>{selectedRoom.type} Room</h3>
            <p className="room-details">{selectedRoom.details}</p>
            <p>{selectedRoom.desc}</p>
            <div className="room-divider" />
            <p className="room-amenities">{selectedRoom.amenities}</p>
            <p className="room-price">৳{selectedRoom.price} / night</p>
            <p>{nights > 0 ? nights + " night(s) × ৳" + selectedRoom.price + " = ৳" + (nights * selectedRoom.price) : "Pick your dates in the booking bar above to see the total."}</p>
            <button className="btn btn-primary" type="button" onClick={() => bookRoomCard(selectedRoom.type)}>Book Now</button>
            <button className="btn btn-outline" type="button" onClick={() => setSelectedRoom(null)} style={{ marginLeft: 10 }}>Back to Rooms</button>
          </div>
        ) : (
          <div className="rooms-grid">
            {ROOM_TYPES.map((r) => (
              <div className="card room-card fade-up" key={r.type} onClick={() => setSelectedRoom(r)}>
                <img className="room-img" src={r.img} alt={r.type + " room"} />
                <div className="room-body">
                  <span className="room-badge">{r.badge}</span>
                  <h3>{r.type} Room</h3>
                  <p className="room-details">{r.details}</p>
                  <div className="room-divider" />
                  <p className="room-amenities">{r.amenities}</p>
                  <div className="room-bottom">
                    <p className="room-price">৳{r.price} / night</p>
                    <button className="btn btn-primary" type="button" onClick={(e) => { e.stopPropagation(); bookRoomCard(r.type); }}>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {booking && (
          <div className="summary-card card fade-up" id="booking-summary">
            <h3>Booking Summary — {booking.type} Room</h3>
            <p>Check In: {checkIn} | Check Out: {checkOut} | Nights: {nights} | Guests: {guests}</p>
            <p>Room charge: {nights} nights × ৳{booking.price} = ৳{roomTotal}</p>
            <h4>Add Services</h4>
            {SERVICES.map((s) => (
              <label key={s.name} style={{ display: "block", marginBottom: 8 }}>
                <input type="checkbox" checked={pickedServices.includes(s.name)} onChange={() => toggleService(s.name)} />
                {" "}{s.name} — ৳{s.price}
              </label>
            ))}
            <p><strong>Total: ৳{grandTotal}</strong></p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="guestName">Your Name *</label>
                <input id="guestName" className="input" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="guestPhone">Phone *</label>
                <input id="guestPhone" className="input" type="text" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
            </div>
            {isGuest && <p className="guest-note">Signed in as {user.name} ({user.email}) — this booking will be saved to your profile.</p>}
            {bookErr && <div className="error-box">{bookErr}</div>}
            {bookMsg && <div className="success-box">{bookMsg}</div>}
            <button className="btn btn-primary" type="button" onClick={confirmBooking}>Confirm Booking</button>
          </div>
        )}
      </section>

      <section className="section" id="facilities">
        <h2 className="section-title">Facilities</h2>
        <p className="section-subtitle">All the comforts of a modern hotel stay — and each facility matches a service you can add to your booking.</p>
        <div className="facilities-grid">
          {FACILITIES.map((f) => (
            <div className="card facility-card fade-up" key={f.name}>
              <div className="facility-icon">{ICONS[f.icon]}</div>
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="gallery">
        <h2 className="section-title">Gallery</h2>
        <p className="section-subtitle">Click any photo to see it in detail.</p>
        {galleryIndex === null ? (
          <div className="gallery-grid">
            {GALLERY.map((g, i) => (
              <div key={g.title} className="gallery-item" onClick={() => setGalleryIndex(i)}>
                <img className="gallery-img" src={g.img} alt={g.title} />
                <span className="gallery-title">{g.title}</span>
                <span className="gallery-view">View Details →</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-detail fade-up">
            <img className="gallery-detail-img" src={GALLERY[galleryIndex].img} alt={GALLERY[galleryIndex].title} />
            <h3>{GALLERY[galleryIndex].title}</h3>
            <p>{GALLERY[galleryIndex].desc}</p>
            <div>
              <button className="btn btn-outline btn-small" type="button" onClick={() => setGalleryIndex((galleryIndex + GALLERY.length - 1) % GALLERY.length)}>Previous</button>
              <button className="btn btn-outline btn-small" type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % GALLERY.length)} style={{ marginLeft: 10 }}>Next</button>
              <button className="btn btn-primary btn-small" type="button" onClick={() => setGalleryIndex(null)} style={{ marginLeft: 10 }}>Back to Gallery</button>
            </div>
            <div className="gallery-thumbs">
              {GALLERY.map((g, i) => (
                <img key={g.title} src={g.img} alt={g.title} className={i === galleryIndex ? "active" : ""} onClick={() => setGalleryIndex(i)} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="section" id="reviews">
        <h2 className="section-title">Guest Reviews</h2>
        <p className="section-subtitle">What our guests say about their stay.</p>
        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <div className="card review-card fade-up" key={r.name}>
              <span className="review-quote">❝</span>
              <div className="review-rating">{stars(r.rating)}</div>
              <p>{r.text}</p>
              <div className="review-bottom">
                <p className="review-name">{r.name}</p>
                <p className="review-meta">{r.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-grid">
          <div>
            <h3>Hotel NIVAS</h3>
            <p>A comfortable address in the heart of the city. Bookings, payments and services — everything under one roof.</p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <a href="#rooms">Rooms</a>
            <a href="#facilities">Facilities</a>
            <a href="#gallery">Gallery</a>
            <a href="#reviews">Reviews</a>
          </div>
          <div>
            <h3>Contact</h3>
            <p>Dhaka, Bangladesh</p>
            <p>+880 1711-234567</p>
            <p>info@nivas-hotel.com</p>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Hotel NIVAS. All rights reserved.</div>
      </footer>
    </div>
  );
}
