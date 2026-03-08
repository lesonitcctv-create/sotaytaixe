import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface DailyRevenue {
  id?: string;
  userId: string;
  date: Date;
  revenue: number;
  distance: number;
  notes?: string;
}

const COLLECTION_NAME = 'daily_revenues';

export const addDailyRevenue = async (record: Omit<DailyRevenue, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...record,
      date: Timestamp.fromDate(record.date),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding daily revenue: ', error);
    throw error;
  }
};

export const getDailyRevenues = async (userId: string) => {
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
    })) as DailyRevenue[];
  } catch (error) {
    console.error('Error getting daily revenues: ', error);
    throw error;
  }
};

export const updateDailyRevenue = async (id: string, record: Partial<DailyRevenue>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = { ...record };
    if (record.date) {
      // @ts-ignore
      updateData.date = Timestamp.fromDate(record.date);
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating daily revenue: ', error);
    throw error;
  }
};

export const deleteDailyRevenue = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting daily revenue: ', error);
    throw error;
  }
};
