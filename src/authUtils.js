// src/utils/authUtils.js
import { jwtDecode } from 'jwt-decode';

export const setupAutoLogout = (token, logoutCallback) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp * 1000; // convert seconds to milliseconds
    const currentTime = Date.now();
    const timeoutDuration = expiryTime - currentTime;

    if (timeoutDuration <= 0) {
      logoutCallback(); // Token already expired
      return;
    }

    const logoutTimer = setTimeout(() => {
      logoutCallback();
    }, timeoutDuration);

    return logoutTimer; // for optional cleanup
  } catch (error) {
    console.error('Invalid token:', error);
    logoutCallback();
  }
};
