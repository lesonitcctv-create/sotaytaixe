import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface ChargingSession {
  id?: string;
  userId: string;
  date: Date;
  location: string;
  batteryLevelStart: number;
  batteryLevelEnd: number;
  energyAdded: number;
  cost: number;
  duration: number;
  notes?: string;
}

const COLLECTION_NAME = 'charging_sessions';

export const addChargingSession = async (session: Omit<ChargingSession, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...session,
      date: Timestamp.fromDate(session.date),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding charging session: ', error);
    throw error;
  }
};

export const getChargingSessions = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as ChargingSession[];
  } catch (error) {
    console.error('Error getting charging sessions: ', error);
    throw error;
  }
};

export const updateChargingSession = async (id: string, session: Partial<ChargingSession>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = { ...session };
    if (session.date) {
      // @ts-ignore
      updateData.date = Timestamp.fromDate(session.date);
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating charging session: ', error);
    throw error;
  }
};

export const deleteChargingSession = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting charging session: ', error);
    throw error;
  }
};
