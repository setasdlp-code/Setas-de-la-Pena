// utils/storage.js
// Helper for persisting bio‑check checklist and extraction batches in localStorage.

export const BIO_CHECK_KEY = 'setas_os_bio_check';
export const BATCHES_KEY = 'setas_os_extraction_batches';

/** Load the saved bio‑check state from localStorage.
 * Returns an object with `items` (array of {id, checked, comment})
 * or an empty array if none.
 */
export function loadBioCheck() {
  try {
    const raw = localStorage.getItem(BIO_CHECK_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch (e) {
    console.warn('Failed to load bio‑check from localStorage', e);
    return { items: [] };
  }
}

/** Save the bio‑check state to localStorage. */
export function saveBioCheck(state) {
  try {
    localStorage.setItem(BIO_CHECK_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Failed to save bio‑check to localStorage', e);
    return false;
  }
}

/** Load extraction batches array from localStorage. */
export function loadBatches() {
  try {
    const raw = localStorage.getItem(BATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load batches from localStorage', e);
    return [];
  }
}

/** Save extraction batches array to localStorage. */
export function saveBatches(batches) {
  try {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
    return true;
  } catch (e) {
    console.warn('Failed to save batches to localStorage', e);
    return false;
  }
}
