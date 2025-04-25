import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../config/firebaseConfig';

/**
 * Service for handling event-related operations
 */
const EventService = {
  /**
   * Fetches all events for the current user
   * @returns {Promise<Array>} Array of event objects
   */
  async fetchEvents() {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      const q = query(
        collection(db, 'events'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('startTime', 'asc')
      );
      
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }
};

export default EventService;