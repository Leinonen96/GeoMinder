// services/EventService.js
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from '../config/firebaseConfig'

const EventService = {
  /**
   * Fetch all events for the current user
   * @returns {Promise<Array<{id: string, ...}>>}
   */
  async fetchEvents() {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
    const q = query(
      collection(db, 'events'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('startTime', 'asc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  /**
   * Fetch a single event by its document ID
   * @param {string} id
   * @returns {Promise<{id: string, ...}>}
   */
  async fetchEventById(id) {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
    const ref = doc(db, 'events', id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) {
      throw new Error(`Event with id "${id}" not found`)
    }
    return { id: snapshot.id, ...snapshot.data() }
  },

  /**
   * Save a new event and return its generated ID
   * @param {Object} eventData
   * @returns {Promise<string>}
   */
  async saveEvent(eventData) {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
    const payload = {
      ...eventData,
      userId:     auth.currentUser.uid,
      createdAt:  serverTimestamp(),
      updatedAt:  serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'events'), payload)
    return docRef.id
  },
}

export default EventService
