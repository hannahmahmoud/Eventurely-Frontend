import React, { useEffect, useState } from "react";
import axios from "axios";
import "./../EventDashborad/EventDashborad.css";

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [newEvent, setNewEvent] = useState({
    eventName: "",
    date: "",
    price: "",
    venue: "",
    description: "",
    imageUrl: "",
    category: "MUSIC",
  });

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const categories = ["MUSIC", "TECH", "SPORTS", "ART", "EDUCATION", "BUSINESS"];

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = () => {
    axios.get("http://localhost:9999/api/v1/events/", authHeader)
      .then(res => {
        const data = res.data["Events: "]?.content || [];
        setEvents(data);
      })
      .catch(err => handleError(err));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      fetchEvents();
      return;
    }

    let url = `http://localhost:9999/api/v1/events/search?`;
    url += searchBy === "id" ? `id=${search}` : `name=${search}`;

    axios.get(url, authHeader)
      .then(res => {
        const response = res.data;

        if (searchBy === "id") {
          const eventObj = response["Event: "];
          if (eventObj && eventObj.id) {
            setEvents([eventObj]);
          } else {
            setEvents([]);
            setErrorMessage("Event not found.");
          }
        } else {
          const eventList = response["Event: "];
          if (Array.isArray(eventList) && eventList.length > 0) {
            setEvents(eventList);
          } else {
            setEvents([]);
            setErrorMessage("No matching events found.");
          }
        }
      })
      .catch(err => {
        const msg = err.response?.data?.["Messgae: "] || "Search failed.";
        setErrorMessage(msg);
        setEvents([]);
      });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() === "") {
      fetchEvents();
    }
  };

  const validateInput = (event) => {
    const errors = [];
    if (!event.eventName || !event.date || !event.price || !event.venue || !event.description || !event.imageUrl) {
      errors.push("All fields are required.");
    }
    if (event.price < 0) {
      errors.push("Price cannot be negative.");
    }
    if (new Date(event.date) < new Date().setHours(0, 0, 0, 0)) {
      errors.push("Date cannot be in the past.");
    }
    return errors;
  };

  const handlePost = (e) => {
    e.preventDefault();
    const errors = validateInput(newEvent);
    if (errors.length > 0) return setErrorMessage(errors.join("\n"));

    axios.post("http://localhost:9999/api/v1/events/newEvent", newEvent, authHeader)
      .then(() => {
        fetchEvents();
        setNewEvent({ eventName: "", date: "", price: "", venue: "", description: "", imageUrl: "", category: "MUSIC" });
        setShowModal(false);
        setErrorMessage("");
      })
      .catch(err => handleError(err));
  };

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:9999/api/v1/events/deleteEvent/${deleteTargetId}`, authHeader)
      .then(() => {
        fetchEvents();
        setShowDeleteModal(false);
        setDeleteTargetId(null);
      })
      .catch(err => handleError(err));
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
    setErrorMessage("");
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const errors = validateInput(editingEvent);
    if (errors.length > 0) return setErrorMessage(errors.join("\n"));

    axios.put(`http://localhost:9999/api/v1/events/updateEvent/${editingEvent.id}`, editingEvent, authHeader)
      .then(() => {
        setShowModal(false);
        setEditingEvent(null);
        fetchEvents();
        setErrorMessage("");
      })
      .catch(err => handleError(err));
  };

  const handleError = (err) => {
    const msg = err.response?.data?.message || "Something went wrong.";
    setErrorMessage(msg);
  };

  return (
    <div className="event-dashboard">
      <div className="main-content">
        <div className="dashboard-header">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
            <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
              <option value="name">Search by Name</option>
              <option value="id">Search by ID</option>
            </select>
            <input
              type="text"
              placeholder={`🔍 Search by ${searchBy}...`}
              value={search}
              onChange={handleSearchChange}
            />
          </form>
          <button className="post-button" onClick={() => { setShowModal(true); setEditingEvent(null); setErrorMessage(""); }}>
            ➕ Post New Event
          </button>
        </div>

        <table className="event-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Price</th>
              <th>Venue</th>
              <th>Description</th>
              <th>Image</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? events.map(ev => (
              <tr key={ev.id}>
                <td>{ev.eventName}</td>
                <td>{ev.date}</td>
                <td>{ev.price}</td>
                <td>{ev.venue}</td>
                <td>{ev.description}</td>
                <td><a href={ev.imageUrl} target="_blank" rel="noreferrer">View</a></td>
                <td>{ev.category}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(ev)}>✏️</button>
                  <button className="delete-btn" onClick={() => confirmDelete(ev.id)}>🗑️</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8">No events found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <form onSubmit={editingEvent ? handleUpdate : handlePost}>
            <div className="modal-header">
              <h3>{editingEvent ? "Edit Event" : "Post New Event"}</h3>
              <button type="button" onClick={() => setShowModal(false)}>X</button>
            </div>
            {errorMessage && <div className="error-box">{errorMessage}</div>}
            <input type="text" placeholder="Event Name" value={editingEvent ? editingEvent.eventName : newEvent.eventName} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, eventName: e.target.value }) : setNewEvent({ ...newEvent, eventName: e.target.value })} required />
            <input type="date" value={editingEvent ? editingEvent.date : newEvent.date} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, date: e.target.value }) : setNewEvent({ ...newEvent, date: e.target.value })} required />
            <input type="number" placeholder="Price" value={editingEvent ? editingEvent.price : newEvent.price} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, price: e.target.value }) : setNewEvent({ ...newEvent, price: e.target.value })} required />
            <input type="text" placeholder="Venue" value={editingEvent ? editingEvent.venue : newEvent.venue} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, venue: e.target.value }) : setNewEvent({ ...newEvent, venue: e.target.value })} required />
            <input type="text" placeholder="Description" value={editingEvent ? editingEvent.description : newEvent.description} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, description: e.target.value }) : setNewEvent({ ...newEvent, description: e.target.value })} required />
            <input type="text" placeholder="Image URL" value={editingEvent ? editingEvent.imageUrl : newEvent.imageUrl} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, imageUrl: e.target.value }) : setNewEvent({ ...newEvent, imageUrl: e.target.value })} required />
            <select value={editingEvent ? editingEvent.category : newEvent.category} onChange={e => editingEvent ? setEditingEvent({ ...editingEvent, category: e.target.value }) : setNewEvent({ ...newEvent, category: e.target.value })}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit">{editingEvent ? "Update" : "Post"}</button>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div className="confirm-modal">
          <p>Are you sure you want to delete this event?</p>
          <button className="confirm-delete" onClick={handleDelete}>Yes, Delete</button>
          <button className="confirm-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default EventDashboard;