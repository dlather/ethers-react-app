
export function generateSalt(length) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return '0x' + Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

export function setSecureCookie(name, value, mins) {
    const date = new Date();
    date.setTime(date.getTime() + (mins*60*1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;Secure;HttpOnly;SameSite=Strict`;
}

const { ethers } = require('ethers');

export function hash(move, salt) {
    // Ensure move is a number and salt is a hex string
    if (typeof move !== 'number') {
        throw new Error('Move should be a number');
    }
    if (typeof salt !== 'string' || !salt.startsWith('0x')) {
        throw new Error('Salt should be a hex string');
    }
    
    // Create the hash using ethers.js
    const hashedValue = ethers.utils.solidityKeccak256(
        ['uint8', 'uint256'],
        [move, salt]
    );

    return hashedValue;
}
