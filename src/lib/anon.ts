// Anonymous visitor identity for prototype mode.
// Every browser gets a stable UUID (localStorage + cookie) so feedback,
// teaching and karma can attach to the visitor without an account.

const KEY = 'visitor_id';
const COOKIE = 'visitor_id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function setCookie(id: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(KEY, id);
    }
    setCookie(id);
    return id;
  } catch {
    // localStorage unavailable (private mode etc.) — fall back to cookie
    const m = document.cookie.match(/(?:^|;\s*)visitor_id=([^;]+)/);
    if (m) return m[1];
    const id = generateId();
    setCookie(id);
    return id;
  }
}
