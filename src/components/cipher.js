'use strict'

// Make async later on for performance
// Add bluebird for better error handling
const crypto = require('crypto');
const Promise = require('bluebird');
let cipher = {};

cipher.createCipher = Promise.method((pw) => {
  if (!pw) {
    throw new Error('Passphrase must be provided');
  }
  return crypto.createCipher('aes192', pw);
});

cipher.createDecipher = Promise.method((pw) => {
  if (!pw) {
    throw new Error('Passphrase must be provided');
  }
  return crypto.createDecipher('aes192', pw);
})

cipher.encryptText = (cipher, plainText) => {
  return new Promise(resolve => {
    if (!( typeof plainText === 'string')) {
      throw new Error("2nd param must be plain text");
    }
    let cipherText = '';
    cipher.on('readable', () => {
      var data = cipher.read();
      if (data)
        cipherText += data.toString('hex');
    });
    cipher.on('end', () => {
      resolve(cipherText);
    });
    cipher.write(plainText);
    cipher.end();
  });
}

cipher.decryptText = (decipher, cipherText) => {
  return new Promise(resolve => {
    // if (!( typeof plainText === 'string')) {
    //   throw new Error("2nd param must be plain text");
    // }
    let planText = '';
    decipher.on('readable', () => {
      var data = decipher.read();
      if (data)
        planText += data.toString('utf8');
    });
    decipher.on('end', () => {
      resolve(planText);
    });
    decipher.write(cipherText, 'hex');
    decipher.end();
  });

}

module.exports = cipher;
