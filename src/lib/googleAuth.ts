import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets scope and user profile/email
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in popup flow
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Sign In');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Google Sheets Appending API
export const appendToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Sheets append failed: ${errText}`);
  }
  return response.json();
};

// Sync registration data and retry with fallbacks
export const syncRegistrationToGoogleSheet = async (
  accessToken: string,
  data: { name: string; phone: string; email: string; lineId: string; plan: string }
) => {
  const spreadsheetId = '1iYDR6f3_4PYJuO1Lh_MO3_m9gJxTW6h1h7uEF4baFzU';
  const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  const row = [timestamp, data.name, data.phone, data.email, data.lineId || '', data.plan];
  
  const ranges = ['member!A:F', 'Sheet1!A:F', 'A:F'];
  let lastError: any = null;
  
  for (const range of ranges) {
    try {
      await appendToGoogleSheet(accessToken, spreadsheetId, range, [row]);
      return { success: true, rangeUsed: range };
    } catch (e) {
      console.warn(`Failed appending to path / range "${range}":`, e);
      lastError = e;
    }
  }

  throw lastError || new Error('All Sheets ranges failed to write.');
};

// Sync registration data direct to Google Apps Script Web App URL
export const syncToGoogleAppsScript = async (
  data: { name: string; phone: string; email: string; lineId: string; plan: string }
) => {
  const webAppUrl = 'https://script.google.com/macros/s/AKfycbw9KBRH45re_z-f0gPSVoOWtXSEWIoBKGAhbtM_qBB2NeNkYbxw52pul0T47EiCdZYv/exec';
  const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  
  // Format parameters identically to the working contact request syntax for maximum safety and backend parsing
  const params = new URLSearchParams();
  params.append('timestamp', timestamp);
  params.append('name', data.name);
  params.append('phone', data.phone);
  params.append('email', data.email);
  params.append('lineId', data.lineId || '');
  params.append('plan', data.plan);
  params.append('spreadsheetId', '1iYDR6f3_4PYJuO1Lh_MO3_m9gJxTW6h1h7uEF4baFzU');
  params.append('spreadsheetName', 'member');
  params.append('sheetName', 'member');
  params.append('account', 'get.health.tw@gmail.com');

  const finalUrl = `${webAppUrl}?${params.toString()}`;
  const payload = {
    timestamp,
    name: data.name,
    phone: data.phone,
    email: data.email,
    lineId: data.lineId || '',
    plan: data.plan,
    spreadsheetId: '1iYDR6f3_4PYJuO1Lh_MO3_m9gJxTW6h1h7uEF4baFzU',
    spreadsheetName: 'member',
    sheetName: 'member',
    account: 'get.health.tw@gmail.com'
  };

  try {
    // Send a single POST request containing both query parameters and JSON body.
    // This supports both parameter parsing and JSON body reading with exactly ONE HTTP request,
    // thereby preventing any duplicate row entries in the Google Sheet.
    await fetch(finalUrl, {
      method: 'POST',
      mode: 'no-cors', // Essential to bypass CORS redirection blocks in cross-origin GAS apps
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (err) {
    console.error('Error submitting payload directly to Google Apps Script:', err);
    throw err;
  }
};
