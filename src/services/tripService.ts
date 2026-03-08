import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface TripRevenue {
  id?: string;
  userId: string;
  date: Date;
  app: 'Xanh SM' | 'Be' | 'Grab';
  revenue: number;
  discount: number;
  actualRevenue: number;
  distance: number;
  notes?: string;
}

const COLLECTION_NAME = 'trip_revenues';

export const addTripRevenue = async (record: Omit<TripRevenue, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...record,
      date: Timestamp.fromDate(record.date),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding trip revenue: ', error);
    throw error;
  }
};

export const getTripRevenues = async (userId: string) => {
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
    })) as TripRevenue[];
  } catch (error) {
    console.error('Error getting trip revenues: ', error);
    throw error;
  }
};

export const updateTripRevenue = async (id: string, record: Partial<TripRevenue>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = { ...record };
    if (record.date) {
      // @ts-ignore
      updateData.date = Timestamp.fromDate(record.date);
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating trip revenue: ', error);
    throw error;
  }
};

export const deleteTripRevenue = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting trip revenue: ', error);
    throw error;
  }
};
