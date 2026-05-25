/* Identificator: animatie-banner */

/**
 * Setează un cookie în navigator.
 * @param {string} name - Numele cookie-ului.
 * @param {string} value - Valoarea cookie-ului.
 * @param {number} seconds - Timpul de expirare în secunde.
 */
function setCookie(name, value, seconds) {
    let expires = "";
    if (seconds !== undefined && seconds !== null) {
        const date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        expires = ";expires=" + date.toUTCString(); // Generăm textul doar dacă avem secunde
    }
    document.cookie = name + "=" + value + expires + ";path=/";
}


/**
 * Preluarea valorii unui cookie după nume.
 * @param {string} name - Numele cookie-ului căutat.
 * @returns {string|null} Valoarea cookie-ului sau null dacă nu există.
 */
function getCookie(name) {
    let vector = document.cookie.split("; ");

    for (let c of vector) {
        let [key, value] = c.split("=");
        if (key === name) {
            return value;
        }
    }
    return null;
}

/**
 * Șterge un cookie după nume.
 * @param {string} name - Numele cookie-ului de șters.
 */
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}


function deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        deleteCookie(name);
    }
}
