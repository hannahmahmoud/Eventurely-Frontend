import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './Component/Login/LoginForm';
import Signup from './Component/Signup/Signup';
import EventDashboard from './Component/EventDashborad/EventDashborad';
import Reservation from './Component/Reservation/Reservation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<EventDashboard />} /> 
        <Route path="/reservation" element={<Reservation />} />

      </Routes>
    </Router>
  );
}

export default App;