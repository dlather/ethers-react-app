export function generateSalt(length) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

export async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSalt(salt, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    salt
  );

  return { iv, encryptedSalt: new Uint8Array(encrypted) };
}

export async function decryptSalt(encryptedSalt, key, iv) {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedSalt
  );

  return new Uint8Array(decrypted);
}

export function setSecureCookie(name, value, mins) {
  const date = new Date();
  date.setTime(date.getTime() + mins * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/;Secure;HttpOnly;SameSite=Strict`;
}

export const moves = ["Rock", "Paper", "Scissors", "Spock", "Lizard"];
export const acc1 = "0xc9C1754fD6bAF34A2Ed52cF5E25585958Ddc34A1";
export const acc2 = "0x40E72ea745f86aceEDB1cbD368Ab2D8D055724d0";
export const HashContractAddress = "0x42BD1a89d523788BBA98bC303DB2a73828fAbC82";

export function sanitizeInput(username) {
  // Allow only alphanumeric characters
  if (username === "") {
    return true;
  }
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(username);
}

// encryptedSaltArray: 237,59,113,188,163,226,184,118,49,172,174,36,190,12,181,84,255,15,117,153,206,211,168,23,239,236,225,132,194,131,214,41,211,240,95,211,42,123,43,179,128,174,240,185,44,113,72,59
