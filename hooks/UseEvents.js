import { useState, useEffect } from 'react';
import EventService from '../services/EventService';

/**
 * Custom hook for fetching and managing events
 * @returns {Object} Object containing events, loading state, and error
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      try {
        const data = await EventService.fetchEvents();
        if (mounted) {
          setEvents(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    events,
    loading,
    error
  };
}