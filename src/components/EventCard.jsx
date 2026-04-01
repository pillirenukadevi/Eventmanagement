import React from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import './EventCard.css';

const EventCard = ({ event, onAction, actionText, isRegistered }) => {
  return (
    <div className={`event-card ${isRegistered ? 'registered' : ''}`}>
      <div className="ec-header">
        <span className={`ec-category badge-${event.category.toLowerCase()}`}>{event.category}</span>
        {isRegistered && <span className="ec-badge-status">Registered</span>}
      </div>
      
      <div className="ec-body">
        <h3 className="ec-title">{event.title}</h3>
        <p className="ec-desc line-clamp-2">{event.desc}</p>
        
        <div className="ec-meta">
          <div className="meta-item">
            <Calendar size={14} className="icon-sub" /> 
            <span>{event.date}</span>
          </div>
          <div className="meta-item">
            <Clock size={14} className="icon-sub" /> 
            <span>{event.time}</span>
          </div>
          <div className="meta-item w-full">
            <MapPin size={14} className="icon-sub" /> 
            <span>{event.venue}</span>
          </div>
        </div>
      </div>
      
      <div className="ec-footer">
        <div className="ec-stats">
          <Users size={16} className="text-muted" />
          <span className="text-sm font-medium">{event.registered?.length || 0} Attending</span>
        </div>
        <button 
          className={`btn-action ${isRegistered ? 'btn-outline-danger' : 'btn-primary-sm'}`} 
          onClick={onAction}
        >
          {actionText} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
