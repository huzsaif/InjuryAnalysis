import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Injury, ProgressEntry, RecoveryPlan } from '../types';
import { getAuth } from 'firebase/auth';

export const addInjury = async (injury: Omit<Injury, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'injuries'), {
      ...injury,
      date: Timestamp.fromDate(injury.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('Added injury with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding injury:', error);
    throw error;
  }
};

export const getInjury = async (id: string) => {
  try {
    const docRef = doc(db, 'injuries', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Injury;
    }
    console.log('No injury found with ID:', id);
    return null;
  } catch (error) {
    console.error('Error getting injury:', error);
    throw error;
  }
};

export const getUserInjuries = async (userId: string) => {
  try {
    console.log('Fetching injuries for user:', userId);
    const q = query(
      collection(db, 'injuries'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const injuries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Injury;
    });
    console.log('Found injuries:', injuries.length);
    injuries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return injuries;
  } catch (error) {
    console.error('Error getting user injuries:', error);
    throw error;
  }
};

export const addProgressEntry = async (entry: Omit<ProgressEntry, 'id' | 'date'>) => {
  try {
    const docRef = await addDoc(collection(db, 'progress'), {
      ...entry,
      date: Timestamp.now(),
    });
    console.log('Added progress entry with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding progress entry:', error);
    throw error;
  }
};

export const getInjuryProgress = async (injuryId: string) => {
  try {
    console.log('Fetching progress for injury:', injuryId);
    
    // First verify the injury exists and user has access
    const injuryDoc = await getDoc(doc(db, 'injuries', injuryId));
    if (!injuryDoc.exists()) {
      console.error('Injury not found:', injuryId);
      throw new Error('Injury not found');
    }

    const injuryData = injuryDoc.data();
    if (!injuryData) {
      console.error('Invalid injury data for:', injuryId);
      throw new Error('Invalid injury data');
    }

    // Get the current user's ID from auth
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user');
      throw new Error('Authentication required');
    }

    // Verify ownership
    if (injuryData.userId !== currentUser.uid) {
      console.error('User does not own this injury');
      throw new Error('Access denied');
    }

    console.log('User verified as owner of injury:', injuryId);
    
    const q = query(
      collection(db, 'progress'),
      where('injuryId', '==', injuryId)
    );
    
    console.log('Executing progress query for injury:', injuryId);
    const querySnapshot = await getDocs(q);
    console.log('Found progress entries:', querySnapshot.size);
    
    const progress = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
      } as ProgressEntry;
    });
    
    // Filter entries to ensure they belong to the current user
    const filteredProgress = progress.filter(entry => entry.userId === currentUser.uid);
    console.log('Filtered progress entries:', filteredProgress.length);
    
    // Sort by date
    filteredProgress.sort((a, b) => a.date.getTime() - b.date.getTime());
    return filteredProgress;
  } catch (error) {
    console.error('Error getting injury progress:', error);
    throw error;
  }
};

export const addRecoveryPlan = async (plan: Omit<RecoveryPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'recoveryPlans'), {
    ...plan,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getRecoveryPlan = async (injuryId: string) => {
  const q = query(
    collection(db, 'recoveryPlans'),
    where('injuryId', '==', injuryId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as RecoveryPlan;
  }
  return null;
}; 

export const deleteInjury = async (injuryId: string) => {
  try {
    console.log('Starting injury deletion process for:', injuryId);
    
    // First verify the injury exists and user has access
    const injuryDoc = await getDoc(doc(db, 'injuries', injuryId));
    if (!injuryDoc.exists()) {
      console.error('Injury not found:', injuryId);
      throw new Error('Injury not found');
    }

    const injuryData = injuryDoc.data();
    if (!injuryData) {
      console.error('Invalid injury data for:', injuryId);
      throw new Error('Invalid injury data');
    }

    // Get the current user's ID from auth
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user');
      throw new Error('Authentication required');
    }

    // Verify ownership
    if (injuryData.userId !== currentUser.uid) {
      console.error('User does not own this injury:', currentUser.uid, 'vs', injuryData.userId);
      throw new Error('Access denied');
    }

    console.log('User verified as owner of injury:', injuryId);
    
    // Delete all progress entries for this injury
    console.log('Deleting progress entries for injury:', injuryId);
    const progressQuery = query(
      collection(db, 'progress'),
      where('injuryId', '==', injuryId)
    );
    const progressSnapshot = await getDocs(progressQuery);
    console.log('Found progress entries to delete:', progressSnapshot.size);
    
    const batch = writeBatch(db);
    
    progressSnapshot.docs.forEach((doc) => {
      console.log('Adding progress entry to batch delete:', doc.id);
      batch.delete(doc.ref);
    });

    // Delete the injury document
    console.log('Adding injury to batch delete:', injuryId);
    batch.delete(doc(db, 'injuries', injuryId));

    // Commit the batch
    console.log('Committing batch delete');
    await batch.commit();
    console.log('Successfully deleted injury and related progress');
    
    return true;
  } catch (error) {
    console.error('Error deleting injury:', error);
    throw error;
  }
};