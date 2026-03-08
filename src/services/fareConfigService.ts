import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface FareConfig {
  id: string;
  userId: string;
  name: string;
  openingPrice: string;
  openingDistance: string;
  nextPrice: string;
  longDistancePrice: string;
  longDistanceThreshold: string;
  waitPrice: string;
}

const COLLECTION_NAME = 'fare_configs';

export const addFareConfig = async (config: Omit<FareConfig, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), config);
    return { ...config, id: docRef.id };
  } catch (error) {
    console.error('Error adding fare config: ', error);
    throw error;
  }
};

export const getFareConfigs = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FareConfig[];
  } catch (error) {
    console.error('Error getting fare configs: ', error);
    throw error;
  }
};

export const deleteFareConfig = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting fare config: ', error);
    throw error;
  }
};
