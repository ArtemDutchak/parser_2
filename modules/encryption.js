const CryptoJS = require("crypto-js");

export default {
   encryptMethodLength() {
    const encryptMethod = this.encryptMethod();
    const aesNumber = encryptMethod.match(/\d+/)[0];
    return parseInt(aesNumber);
   },
   secret_key() {
    return 'secret is secret';
   },
   encryptKeySize() {
    const aesNumber = this.encryptMethodLength();
    return parseInt(aesNumber / 8);
   },
   encryptMethod() {
     return 'AES-256-CBC';
   },
   decrypt(encryptedString) {
    const key = this.secret_key()
    const json = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encryptedString)));
    const salt = CryptoJS.enc.Hex.parse(json.salt);
    const iv = CryptoJS.enc.Hex.parse(json.iv);
    const encrypted = json.ciphertext;
    const iterations = parseInt(json.iterations);
    if (iterations <= 0) {
        iterations = 999;
    }
    const encryptMethodLength = (this.encryptMethodLength()/4);
    const hashKey = CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': (encryptMethodLength/8), 'iterations': iterations});
    const decrypted = CryptoJS.AES.decrypt(encrypted, hashKey, {'mode': CryptoJS.mode.CBC, 'iv': iv});
    return decrypted.toString(CryptoJS.enc.Utf8);
   },
   encrypt(string) {
    const key = this.secret_key()
    // const iv = CryptoJS.lib.WordArray.random(16);
    // const salt = CryptoJS.lib.WordArray.random(256);
    const iv = CryptoJS.lib.WordArray.random(8);
    const salt = CryptoJS.lib.WordArray.random(8);
    const iterations = 999;
    const encryptMethodLength = (this.encryptMethodLength()/4);
    const hashKey = CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': (encryptMethodLength/8), 'iterations': iterations});
    const encrypted = CryptoJS.AES.encrypt(string, hashKey, {'mode': CryptoJS.mode.CBC, 'iv': iv});
    const encryptedString = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    const output = {
        'ciphertext': encryptedString,
        'iv': CryptoJS.enc.Hex.stringify(iv),
        'salt': CryptoJS.enc.Hex.stringify(salt),
        'iterations': iterations
    };
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(output)));
   }
}
