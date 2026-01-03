// Firestore CRUD Operations
// Reusable methods for database operations

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  WhereFilterOp,
  OrderByDirection,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './index';

// ==================== CREATE ====================

/**
 * Create a new document with auto-generated ID
 * @param collectionName - Name of the collection (e.g., 'users', 'bookings')
 * @param data - Data to store
 * @returns Document ID
 */
export const createDocument = async (
  collectionName: string,
  data: DocumentData
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

/**
 * Create a document with a specific ID
 * @param collectionName - Name of the collection
 * @param documentId - Custom document ID
 * @param data - Data to store
 */
export const setDocument = async (
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<void> => {
  try {
    await setDoc(doc(db, collectionName, documentId), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error setting document:', error);
    throw error;
  }
};

// ==================== READ ====================

/**
 * Get a single document by ID
 * @param collectionName - Name of the collection
 * @param documentId - Document ID
 * @returns Document data or null if not found
 */
export const getDocument = async (
  collectionName: string,
  documentId: string
): Promise<DocumentData | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Get all documents from a collection
 * @param collectionName - Name of the collection
 * @returns Array of documents
 */
export const getAllDocuments = async (
  collectionName: string
): Promise<DocumentData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all documents:', error);
    throw error;
  }
};

/**
 * Query documents with filters
 * @param collectionName - Name of the collection
 * @param filters - Array of filter conditions [field, operator, value]
 * @param orderByField - Field to order by (optional)
 * @param orderDirection - Order direction: 'asc' or 'desc' (optional)
 * @param limitCount - Limit number of results (optional)
 * @returns Array of matching documents
 */
export const queryDocuments = async (
  collectionName: string,
  filters: [string, WhereFilterOp, any][] = [],
  orderByField?: string,
  orderDirection: OrderByDirection = 'asc',
  limitCount?: number
): Promise<DocumentData[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    // Add where clauses
    filters.forEach(([field, operator, value]) => {
      constraints.push(where(field, operator, value));
    });

    // Add order by
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
};

// ==================== UPDATE ====================

/**
 * Update a document (partial update)
 * @param collectionName - Name of the collection
 * @param documentId - Document ID
 * @param data - Data to update
 */
export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: Partial<DocumentData>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// ==================== DELETE ====================

/**
 * Delete a document
 * @param collectionName - Name of the collection
 * @param documentId - Document ID
 */
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// ==================== BATCH OPERATIONS ====================

/**
 * Get multiple documents by IDs
 * @param collectionName - Name of the collection
 * @param documentIds - Array of document IDs
 * @returns Array of documents
 */
export const getDocumentsByIds = async (
  collectionName: string,
  documentIds: string[]
): Promise<DocumentData[]> => {
  try {
    const promises = documentIds.map(id => getDocument(collectionName, id));
    const results = await Promise.all(promises);
    return results.filter(doc => doc !== null) as DocumentData[];
  } catch (error) {
    console.error('Error getting documents by IDs:', error);
    throw error;
  }
};
