import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import './EventModal.css';

const EventModal = ({ event, onClose, onRegister, isRegistered, isStudent }) => {
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', roll: '' });

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRegister(event.id, formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit registration. Check console.");
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await onRegister(event.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <button className="modal-close btn-icon relative" onClick={onClose}>
          <X size={24} className="text-muted" />
        </button>
        
        <div className="modal-header">
          <span className={`ec-category badge-${event.category.toLowerCase()}`}>{event.category}</span>
          <h2 className="modal-title font-bold text-main">{event.title}</h2>
        </div>

        {!showForm && !success && (
          <div className="modal-body animate-fade-in">
            <div className="modal-desc">
              <h4 className="font-semibold text-main mb-2">About Event</h4>
              <p className="text-muted leading-relaxed">{event.desc}</p>
            </div>

            <div className="modal-details bg-surface-light rounded-lg">
              <div className="m-detail-item">
                <Calendar size={18} className="text-primary" />
                <span>{event.date}</span>
              </div>
              <div className="m-detail-item">
                <Clock size={18} className="text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="m-detail-item">
                <MapPin size={18} className="text-primary" />
                <span>{event.venue}</span>
              </div>
              <div className="m-detail-item">
                <Users size={18} className="text-primary" />
                <span>{event.registered?.length || 0} Registrations</span>
              </div>
            </div>

            <div className="modal-footer">
              {isStudent && (
                isRegistered ? (
                  <button className="btn-outline-danger w-full" onClick={handleCancelRegistration}>
                    Cancel Registration
                  </button>
                ) : (
                  <button className="btn-primary w-full" onClick={() => setShowForm(true)}>
                    Register Now
                  </button>
                )
              )}
              {!isStudent && (
                 <div className="text-center w-full text-muted">
                   As a faculty, you cannot register. Check your Manager to edit.
                 </div>
              )}
            </div>
          </div>
        )}

        {showForm && !success && (
          <div className="modal-registration-form animate-fade-in">
            <h3 className="text-main mb-4 font-bold text-xl">Event Registration</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label>Student Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email ID</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your student email"
                />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.roll}
                  onChange={(e) => setFormData({...formData, roll: e.target.value})}
                  placeholder="E.g., 2023CS015"
                />
              </div>
              <div className="form-actions mt-4">
                <button type="button" className="btn-secondary w-full" onClick={() => setShowForm(false)}>Back</button>
                <button type="submit" className="btn-primary w-full">Submit</button>
              </div>
            </form>
          </div>
        )}

        {success && (
          <div className="modal-success animate-fade-in text-center py-6">
            <CheckCircle size={64} className="text-success mx-auto mb-4" />
            <h3 className="text-main font-bold text-2xl mb-2">Registered Successfully!</h3>
            <p className="text-muted mb-6">Your spot for {event.title} has been confirmed.</p>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
