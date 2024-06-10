# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
https://medium.com/coinmonks/integrating-ether-js-with-react-a-comprehensive-guide-cd9ccba57b93

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


In the context of a blockchain-based Rock Paper Scissors game, the secure generation, storage, and verification of the salt are crucial to ensuring the fairness and security of the game. Here's how the methods mentioned earlier would help:

### 1. **Secure Generation of Salt**
Generating a strong, unpredictable salt is fundamental in preventing an opponent from guessing the committed move by the first player.

- **Method**: Using `window.crypto.getRandomValues` ensures the salt is cryptographically secure and unpredictable.
  
### 2. **Key Derivation Using Web Crypto API**
Deriving a key from the user's password using PBKDF2 adds a layer of security, making it difficult for an attacker to brute force the key and access the salt.

- **Method**: `crypto.subtle.importKey` and `crypto.subtle.deriveKey` securely derive a key using the user's password and a salt.
  
### 3. **Encryption of Salt**
Encrypting the salt before storing it in localStorage ensures that even if an attacker gains access to localStorage, they cannot easily decipher the salt without the encryption key.

- **Method**: Using AES-GCM for encryption with `crypto.subtle.encrypt`, combined with a unique IV for each encryption operation, ensures strong confidentiality.
  
### 4. **Verification of Salt Integrity**
Signing the encrypted salt and storing the signature allows verification of the salt's integrity. This prevents tampering, ensuring that the salt retrieved for decryption is the same as the one initially stored.

- **Method**: Using the Ethereum signer to sign the salt, and then verifying it with the user's Ethereum address, ensures the salt has not been altered.

### 5. **Secure Storage Using LocalStorage**
While localStorage is generally not the most secure storage method, encrypting the data and signing it adds significant protection. Encrypting the salt and using secure key derivation makes it much harder for an attacker to access or manipulate the salt.

### 6. **Comparison to Other Storage Methods**
- **LocalStorage**: Easy to use but vulnerable if not encrypted.
- **IndexedDB**: More secure and capable of storing larger amounts of data.
- **Secure Cookies**: Suitable for storing smaller pieces of data securely but might be less flexible for larger data and more complex operations.

### Example in the Context of Rock Paper Scissors

Here’s a detailed explanation and example on how these methods ensure security and fairness in the game:

#### **Steps in the Game**

1. **Player 1 (j1) Commit Phase**
   - Generates a move and a random salt.
   - Uses the Web Crypto API to securely generate the salt.
   - Commits the move by storing a hash of the move and salt on-chain.

   ```javascript
   const move = 'rock'; // Example move
   const salt = generateSalt(32); // Securely generate salt
   const moveHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string', 'bytes32'], [move, salt]));
   ```

2. **Player 2 (j2) Play Phase**
   - Submits their move directly on-chain.
   - This ensures both players have committed their moves before revealing.

   ```javascript
   const move2 = 'scissors'; // Example move for j2
   contract.play(move2, { value: stake });
   ```

3. **Player 1 (j1) Reveal Phase**
   - Reveals the move and the salt.
   - The contract verifies the revealed move and salt against the stored hash.

   ```javascript
   const revealedMove = 'rock';
   const revealedSalt = salt;
   contract.solve(revealedMove, revealedSalt);
   ```

#### **Enhancing Security**

1. **Securely Generate and Encrypt Salt**
   - Generate a salt using the Web Crypto API.
   - Encrypt the salt using AES-GCM before storing it in localStorage.

   ```javascript
   const salt = generateSalt(32);
   const password = 'user-password'; // User's password for deriving the encryption key
   const saltForKDF = generateSalt(16); // Salt for key derivation
   const key = await deriveKey(password, saltForKDF);
   const { iv, encryptedSalt } = await encryptSalt(salt, key);

   localStorage.setItem('encryptedSalt', JSON.stringify({ iv: Array.from(iv), data: Array.from(encryptedSalt) }));
   localStorage.setItem('saltForKDF', Array.from(saltForKDF));
   ```

2. **Sign and Verify Salt**
   - Sign the encrypted salt with the Ethereum signer.
   - Store the signature in localStorage.

   ```javascript
   const signer = provider.getSigner();
   const signature = await signer.signMessage(encryptedSalt);

   localStorage.setItem('signature', signature);
   ```

3. **Verification and Decryption**
   - When retrieving the salt, verify its integrity using the signature.
   - Decrypt the salt using the derived key.

   ```javascript
   const storedEncryptedSalt = JSON.parse(localStorage.getItem('encryptedSalt'));
   const storedSaltForKDF = Uint8Array.from(localStorage.getItem('saltForKDF').split(','));
   const storedSignature = localStorage.getItem('signature');

   const derivedKey = await deriveKey(password, storedSaltForKDF);
   const isValid = await signer.verifyMessage(storedEncryptedSalt.data, storedSignature);

   if (isValid) {
     const decryptedSalt = await decryptSalt(Uint8Array.from(storedEncryptedSalt.data), derivedKey, Uint8Array.from(storedEncryptedSalt.iv));
     console.log('Decrypted salt:', decryptedSalt);
   } else {
     console.error('Invalid salt or signature.');
   }
   ```

By implementing these security measures, you can significantly enhance the security and fairness of the Rock Paper Scissors game on the blockchain, ensuring that the salt is handled securely and that any attempts to manipulate the game are mitigated.


Using in-memory storage with web workers can enhance the security and privacy of sensitive data like salt in a Rock Paper Scissors game. Web workers provide a separate thread of execution, which means they can handle data without risking exposure to the main thread.

Here's how you can adapt the provided methods to use in-memory storage with web workers:

### 1. Secure Generation of Salt
- Use `window.crypto.getRandomValues` within the web worker to generate a strong, unpredictable salt.

### 2. Key Derivation Using Web Crypto API
- You can still use `crypto.subtle.importKey` and `crypto.subtle.deriveKey` within the web worker to derive a key from the user's password.

### 3. Encryption of Salt
- Use `crypto.subtle.encrypt` within the web worker to encrypt the salt before storing it in memory.

### 4. Verification of Salt Integrity
- Signing the salt and verifying its integrity can still be done within the web worker using the Ethereum signer.

### 5. Secure Storage Using Web Workers
- Use a web worker to handle the storage and manipulation of sensitive data like salt.
- The main thread communicates with the web worker to perform operations on the data, ensuring that sensitive information remains isolated from the main application logic.

### Example Usage with Web Workers

Here's how you can use web workers for secure storage of salt in a Rock Paper Scissors game:

1. Create a separate JavaScript file (`worker.js`) containing the logic for salt generation, encryption, and verification.

```javascript
// worker.js
self.onmessage = function(event) {
  const data = event.data;
  if (data.operation === 'generateSalt') {
    const salt = generateSalt(data.length);
    self.postMessage({ salt: salt });
  }
  // Add other operations like encryption, decryption, and verification
}

function generateSalt(length) {
  const salt = new Uint8Array(length);
  window.crypto.getRandomValues(salt);
  return salt;
}

// Add other functions for encryption, decryption, and verification
```

2. In your main JavaScript file (`main.js`), create a web worker and communicate with it to perform operations on the salt.

```javascript
// main.js
const saltWorker = new Worker('worker.js');

saltWorker.onmessage = function(event) {
  const salt = event.data.salt;
  console.log('Generated salt:', salt);
  // Proceed with further operations on the salt
}

// Request the web worker to generate a salt
saltWorker.postMessage({ operation: 'generateSalt', length: 32 });
```

By using web workers for secure storage and manipulation of sensitive data like salt, you can ensure that the data remains isolated from the main application logic, enhancing security and privacy.