import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocFromServer,
  query,
  where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

// Initialize Firestore with custom database ID from config if present
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

// CRITICAL CONSTRAINT: Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test_connection_test_doc_dummy', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firestore connection test: reachable", error);
    }
  }
}
testConnection();

// Generic helpers for App synchronization
export async function loadUserCollection<T>(colName: string, userId: string): Promise<T[]> {
  try {
    const q = query(collection(db, colName), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as T);
    });
    return items;
  } catch (error) {
    console.error(`Error loading collection ${colName} for user ${userId}:`, error);
    return [];
  }
}

export async function loadCollection<T>(colName: string, defaultData: T[]): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, colName));
    if (querySnapshot.empty) {
      console.log(`Collection ${colName} is empty. Seeding default items...`);
      // Seed default items
      for (const item of defaultData) {
        const id = (item as any).id || "doc_" + Math.random().toString(36).substring(2, 9);
        await setDoc(doc(db, colName, id), item as any);
      }
      return defaultData;
    }
    
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as T);
    });
    return items;
  } catch (error) {
    console.error(`Error loading collection ${colName}:`, error);
    return defaultData;
  }
}

export async function saveDocument(colName: string, id: string, data: any): Promise<void> {
  try {
    await setDoc(doc(db, colName, id), data);
  } catch (error) {
    console.error(`Error saving document to ${colName}/${id}:`, error);
  }
}

export async function deleteDocument(colName: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, colName, id));
  } catch (error) {
    console.error(`Error deleting document from ${colName}/${id}:`, error);
  }
}

export { db, auth };
