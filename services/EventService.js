// services/EventService.js
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
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
      console.warn("No user signed in; returning empty event list.")
      return []
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
   * @returns {Promise<{id: string, ...} | null>}
   */
  async fetchEventById(id) {
    const ref = doc(db, 'events', id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) {
      console.warn(`Event ${id} not found.`)
      return null
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
      console.log("Signing in anonymously before saving event…")
      await signInAnonymously(auth)
    }
    if (!auth.currentUser) {
      throw new Error("Unable to sign in.")
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

  /**
   * Update an existing event by its ID
   * @param {string} id
   * @param {Object} eventData
   */
  async updateEvent(id, eventData) {
    if (!auth.currentUser) {
      console.log("Signing in anonymously before updating event…")
      await signInAnonymously(auth)
    }
    if (!auth.currentUser) {
      throw new Error("Unable to sign in.")
    }

    const ref = doc(db, 'events', id)
    const payload = {
      ...eventData,
      updatedAt: serverTimestamp(),
    }
    // merge:true means we only overwrite the fields we pass
    await setDoc(ref, payload, { merge: true })
  },

  // Delete an event by its ID
  async deleteEvent(id) {
    if (!auth.currentUser) {
      throw new Error('Not signed in')
    }
    const ref = doc(db, 'events', id)
    await deleteDoc(ref)
  },
}

export default EventService
