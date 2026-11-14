'use strict';
const {expect}=require('@playwright/test');

// Check the native record, not Playwright's exported JSON: optional Firebase
// fields can make Playwright use valueEncoded instead of value in storageState.
async function savePersistedAuthState(page, storagePath) {
  await expect.poll(() => page.evaluate(async () => {
    const auth = window.SetasFirebase?.auth;
    const uid = auth?.currentUser?.uid;
    const apiKey = auth?.app?.options?.apiKey;
    const appName = auth?.app?.name;
    if (!uid || !apiKey || !appName) return false;
    let database;
    try {
      // Opening a missing DB would create an empty one ahead of Firebase.
      const databases = await indexedDB.databases();
      if (!databases.some(db => db.name === 'firebaseLocalStorageDb')) return false;
      database = await new Promise((resolve, reject) => {
        const request = indexedDB.open('firebaseLocalStorageDb');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = () => request.transaction.abort();
      });
      if (!database.objectStoreNames.contains('firebaseLocalStorage')) return false;
      const key = `firebase:authUser:${apiKey}:${appName}`;
      const record = await new Promise((resolve, reject) => {
        const transaction = database.transaction('firebaseLocalStorage', 'readonly');
        const request = transaction.objectStore('firebaseLocalStorage').get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.onabort = () => reject(transaction.error);
      });
      return record?.value?.uid === uid;
    } catch {
      return false;
    } finally {
      database?.close();
    }
  }), {timeout:10000, intervals:[100], message:'Firebase Auth debe quedar persistido para la sesión activa'}).toBe(true);

  // Let Playwright preserve either value or valueEncoded without decoding it.
  return page.context().storageState({path:storagePath, indexedDB:true});
}

module.exports = {savePersistedAuthState};
