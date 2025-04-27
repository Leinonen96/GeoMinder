// services/EventService.js
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from '../config/firebaseConfig'

const EventService = {
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
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  async saveEvent(eventData) {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
    const payload = {
      ...eventData,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'events'), payload)
    return docRef.id
  },
}

export default EventService
