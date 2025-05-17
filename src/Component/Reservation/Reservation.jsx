import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Reservation.css";

const Reservation = () => {
  const [events, setEvents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showReservations, setShowReservations] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");
  const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:9999/api/v1/events/", authHeader);
      const data = response.data["Events: "]?.content || response.data["Events"] || [];
      if (data.length === 0) {
        setErrorMessage(response.data["Message"] || "No events found.");
      } else {
        setEvents(data);
        console.log("Fetched events:", data);
      }
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to fetch events. Check backend or token.";
      setErrorMessage(msg);
      console.error("API Error:", err);
    }
  };

  const fetchReservations = async () => {
    if (!token) {
      setErrorMessage("Please log in to view reservations.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:9999/api/v1/booking/", authHeader);
      const data = response.data["Reservations"] || [];
      if (data.length === 0) {
        setErrorMessage(response.data["Message"] || "No reservations found.");
      }
      setReservations(data);
      setShowReservations(true);
      console.log("Fetched reservations:", data);
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to fetch reservations. Check backend or token.";
      setErrorMessage(msg);
      console.error("Reservations API Error:", err);
    }
  };

  const handleBookEvent = async (eventId) => {
    if (!token) {
      setErrorMessage("Please log in to make a reservation.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:9999/api/v1/booking/newReservation/${eventId}`, {}, authHeader);
      setErrorMessage(response.data["Message"] || "Reservation successful!");
      setTimeout(() => setErrorMessage(""), 3000);
      fetchReservations();
    } catch (err) {
      setErrorMessage(err.response?.data?.Message || err.response?.data?.message || "Reservation failed.");
    }
  };

  const handleDeleteReservation = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:9999/api/v1/booking/deleteReservation/${id}`, authHeader);
      setReservations(reservations.filter(r => r.id !== id));
      setErrorMessage(response.data?.Message || "Reservation deleted!");
      setTimeout(() => setErrorMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.Message || err.response?.data?.message || "Deletion failed.");
    }
  };

  return (
    <div className="reservation-container">
      <header className="header">
        <div className="logo">Eventurly</div>
        <nav className="nav">
          <button className="nav-btn" onClick={() => fetchEvents()}>Events</button>
          <button className="nav-btn" onClick={() => fetchReservations()}>Your Reservations</button>
        </nav>
      </header>

      <div className="hero">
        <h1>Discover & Promote Upcoming Events</h1>
      </div>

      <section className="events-section">
        <h2>Featured Events</h2>
        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="event-card">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.eventName} className="event-image" />
                ) : (
                  <div className="event-image-placeholder"></div>
                )}
                <h3>{event.eventName}</h3>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <p>Organized by: Set Your Vendor</p>
                <button onClick={() => handleBookEvent(event.id)} className="buy-btn">
                  Buy Now
                </button>
              </div>
            ))
          ) : (
            <p>{errorMessage || "Loading events..."}</p>
          )}
        </div>
        {showReservations && reservations.length > 0 && (
          <div className="reservations-list">
            <h2>Your Reservations</h2>
            <ul>
              {reservations.map(res => (
                <li key={res.id}>
                  Reservation ID: {res.id} - Event ID: {res.eventId}
                  <button onClick={() => handleDeleteReservation(res.id)} className="delete-btn">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {showReservations && reservations.length === 0 && (
          <p className="no-reservations">{errorMessage || "No reservations found."}</p>
        )}
        <button className="see-more-btn">See More Events</button>
      </section>

      {errorMessage && !showReservations && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default Reservation;