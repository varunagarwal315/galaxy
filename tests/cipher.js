'use strict'

const cipher = require('../src/components/cipher.js');

// Expected output 597f36dd4d4ae0adaf171b1317e998aa
cipher.createCipher('secretWord')
  .then(data => cipher.encryptText(data, 'hello world'))
  .then(data => console.log(data))
  .catch(err => console.log(err));

// Expected output hello world
cipher.createDecipher('secretWord')
  .then(decipher => cipher.decryptText(decipher, '597f36dd4d4ae0adaf171b1317e998aa'))
  .then(data => console.log(data))
  .catch(err => console.log(err));

function completeFlowCheck(passphrase, plainText) {
  cipher.createCipher('secretWord')
    .then(data => cipher.encryptText(data, plainText))
    .then(data => {
      cipher.createDecipher('secretWord')
        .then(decipher => cipher.decryptText(decipher, data))
        .then(data => console.log(data))
        .catch(err => console.log(err));
    })
}

// Output should be the 2nd param input
completeFlowCheck('secret', 'hello varun');
