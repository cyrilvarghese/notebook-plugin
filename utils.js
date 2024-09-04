// utils.js

// Utility function to check if a word is a valid URL
export function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }