import { useState, useEffect, useCallback } from 'react';
import EventService from '../services/EventService';
import { auth } from '../config/firebaseConfig';

/**
 * Custom hook to fetch and manage the current user's events from Firestore.
 * Provides events data, loading state, error state, and a manual reload function.
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches events from Firestore for the current user
   */
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!auth.currentUser) {
        console.log("useEvents: No user logged in, setting empty events array");
        setEvents([]);
        return;
      }
      
      console.log("useEvents: Fetching events for user:", auth.currentUser.uid);
      const data = await EventService.fetchEvents();
      console.log(`useEvents: Fetched ${data.length} events`);
      setEvents(data);
    } 
    catch (err) {
      console.error("useEvents: Error fetching events:", err);
      setError(err);
    } 
    finally {
      setLoading(false);
    }
  }, [auth.currentUser]);

  // Load events when component mounts or user changes
  useEffect(() => {
    console.log("useEvents: Loading events");
    reload();
  }, [reload]);

  return { events, loading, error, reload };
}