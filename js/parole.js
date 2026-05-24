const crypto = require('crypto');

/**
 * Modulul parole oferă utilitare criptografice pentru parole,
 * cum ar fi generarea de token-uri unice pentru înregistrare/confirmare.
 */
const parole = {
    /**
     * Generează un token hexazecimal criptografic aleator de o anumită lungime.
     * @param {number} lungime - Lungimea dorită a token-ului rezultat
     * @returns {string} Token-ul generat în hex
     */
    genereazaToken(lungime) {
        return crypto.randomBytes(Math.ceil(lungime / 2)).toString('hex').slice(0, lungime);
    }
};

module.exports = parole;
