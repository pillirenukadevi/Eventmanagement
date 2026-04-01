import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { Search, Filter, Bell } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { generateMockEvents } from '../utils/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Academic'];

  useEffect(() => {
    // Stream events from Firestore
    const eventsRef = collection(db, 'events');
    
    const unsubscribe = onSnapshot(eventsRef, async (snapshot) => {
      if (snapshot.empty) {
        // If the database is completely empty, optionally seed it with our 20 mock events.
        try {
          const batch = writeBatch(db);
          const mocks = generateMockEvents();
          mocks.forEach(mock => {
             const newDocRef = doc(eventsRef);
             batch.set(newDocRef, { ...mock, id: newDocRef.id });
          });
          await batch.commit();
        } catch(e) {
          console.error("Initial mock seeding failed (likely due to Security Rules):", e);
        }
      } else {
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore real-time subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async (eventId, formData = null) => {
    if (currentUser.role !== 'student' || !currentUser.uid) return;
    
    const eventToUpdate = events.find(ev => ev.id === eventId);
    if (!eventToUpdate) return;
    
    const registeredList = eventToUpdate.registered || [];
    const isRegistered = registeredList.some(r => (typeof r === 'string' ? r : r.uid) === currentUser.uid);
    
    let newRegistered;
    if (isRegistered) {
      newRegistered = registeredList.filter(r => (typeof r === 'string' ? r : r.uid) !== currentUser.uid);
    } else {
      const regData = formData 
        ? { uid: currentUser.uid, ...formData, registeredAt: new Date().toISOString() } 
        : { uid: currentUser.uid, name: currentUser.name || 'Student', email: currentUser.email };
      newRegistered = [...registeredList, regData];
    }

    try {
      const eventDocRef = doc(db, 'events', eventId);
      await updateDoc(eventDocRef, { registered: newRegistered });

      const globalRegDocRef = doc(db, 'registrations', `${currentUser.uid}_${eventId}`);

      if (!isRegistered) {
        setNotifications(prev => [`✅ Registered for ${eventToUpdate.title}`, ...prev]);
        const regData = formData 
          ? { uid: currentUser.uid, ...formData, registeredAt: new Date().toISOString() } 
          : { uid: currentUser.uid, name: currentUser.name || 'Student', email: currentUser.email };
          
        await setDoc(globalRegDocRef, {
           eventId: eventId,
           eventTitle: eventToUpdate.title,
           studentId: currentUser.uid,
           studentName: regData.name || "Student",
           rollNumber: regData.roll || "N/A",
           email: regData.email || "",
           registeredAt: new Date().toISOString()
        });
      } else {
        setNotifications(prev => [`❌ Cancelled ${eventToUpdate.title}`, ...prev]);
        await deleteDoc(globalRegDocRef);
      }
      
      // Update selected event modal optimism
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent({ ...eventToUpdate, registered: newRegistered });
      }
    } catch (error) {
       console.error("Error registering for event:", error);
       alert("Failed to update registration status. " + error.message);
       throw error;
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) || ev.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 50);
  const myEvents = currentUser.role === 'student' 
    ? events.filter(e => e.registered?.some(r => (typeof r === 'string' ? r : r.uid) === currentUser.uid))
    : events.filter(e => e.creatorId === currentUser.uid);

  if (loading) return <div className="p-8 text-center"><p className="text-muted">Loading events from Cloud Database...</p></div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header glass-card">
        <div>
          <h1 className="text-gradient">Hello, {currentUser.name || 'User'}!</h1>
          <p className="text-muted">Welcome to your personalized event dashboard.</p>
        </div>
        
        <div className="relative">
          <button 
            className="btn-secondary btn-icon relative" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-dot"></span>}
          </button>

          {showNotifications && (
            <>
              <div 
                style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 90}} 
                onClick={() => setShowNotifications(false)}
              ></div>
              <div 
                className="glass-card animate-fade-in" 
                style={{position: 'absolute', right: 0, top: '3.5rem', width: '280px', zIndex: 100, padding: '1rem'}}
              >
                <h4 style={{fontWeight: 700, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  Notifications
                  <button onClick={() => setShowNotifications(false)} style={{background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer'}}>✕</button>
                </h4>
                {notifications.length === 0 ? (
                  <p className="text-muted" style={{fontSize: '0.85rem'}}>No notifications yet.</p>
                ) : (
                  <ul className="flex-col gap-2" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {notifications.map((n, i) => (
                      <li key={i} style={{fontSize: '0.85rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem'}}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <section className="controls-section glass-card">
        <div className="search-bar">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search events by title or venue..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-scroll">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="main-feed">
          <h2 className="section-title">Upcoming Discoveries</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid-col-2">
              {upcomingEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onAction={() => handleViewDetails(event)}
                  actionText="View Details"
                  isRegistered={event.registered?.some(r => (typeof r === 'string' ? r : r.uid) === currentUser.uid)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <p>No events found matching your criteria.</p>
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="glass-card my-events-widget">
            <h3 className="widget-title">
              {currentUser.role === 'student' ? 'My Registrations' : 'My Hosted Events'}
            </h3>
            <div className="widget-list">
              {myEvents.length > 0 ? myEvents.map(ev => (
                <div key={ev.id} className="widget-item cursor-pointer" onClick={() => handleViewDetails(ev)}>
                  <div className="widget-item-date">
                    <span className="day">{new Date(ev.date).getDate()}</span>
                    <span className="month">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="widget-item-info">
                    <p className="title">{ev.title}</p>
                    <p className="time">{ev.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted text-sm">No events right now.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          isRegistered={selectedEvent.registered?.some(r => (typeof r === 'string' ? r : r.uid) === currentUser.uid)}
          isStudent={currentUser.role === 'student'}
        />
      )}
    </div>
  );
};

export default Dashboard;
