/**
 * Offline storage layer using IndexedDB.
 * Caches course content, chat history, and certificates for offline access.
 */

const DB_NAME = 'ncct-offline';
const DB_VERSION = 1;

interface CachedCourse {
  id: string;
  data: unknown;
  cachedAt: number;
}

interface CachedChat {
  id: string;
  sessionId: string;
  messages: { role: string; content: string; timestamp: number }[];
  cachedAt: number;
}

interface CachedCertificate {
  id: string;
  data: unknown;
  cachedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chats')) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
        chatStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains('certificates')) {
        db.createObjectStore('certificates', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

/* ============================================================
   Course Cache
   ============================================================ */

export async function cacheCourse(id: string, data: unknown): Promise<void> {
  const store = await getStore('courses', 'readwrite');
  const record: CachedCourse = { id, data, cachedAt: Date.now() };
  store.put(record);
}

export async function getCachedCourse(id: string): Promise<unknown | null> {
  const store = await getStore('courses');
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCachedCourses(): Promise<CachedCourse[]> {
  const store = await getStore('courses');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ============================================================
   Chat Cache
   ============================================================ */

export async function cacheChatMessage(
  sessionId: string,
  role: string,
  content: string
): Promise<void> {
  const store = await getStore('chats', 'readwrite');
  const id = `${sessionId}-${Date.now()}`;
  const record: CachedChat = {
    id,
    sessionId,
    messages: [{ role, content, timestamp: Date.now() }],
    cachedAt: Date.now(),
  };
  store.put(record);
}

export async function getCachedChats(sessionId: string): Promise<CachedChat[]> {
  const store = await getStore('chats');
  const index = store.index('sessionId');
  return new Promise((resolve, reject) => {
    const request = index.getAll(sessionId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ============================================================
   Certificate Cache
   ============================================================ */

export async function cacheCertificate(id: string, data: unknown): Promise<void> {
  const store = await getStore('certificates', 'readwrite');
  const record: CachedCertificate = { id, data, cachedAt: Date.now() };
  store.put(record);
}

export async function getCachedCertificates(): Promise<CachedCertificate[]> {
  const store = await getStore('certificates');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ============================================================
   Online / Offline Detection
   ============================================================ */

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
