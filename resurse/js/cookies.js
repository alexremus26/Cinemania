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
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Lax";
    console.log(`[COOKIE] Setat cookie "${name}" cu valoarea "${value}" expirând în ${seconds} secunde.`);
}

/**
 * Preluarea valorii unui cookie după nume.
 * @param {string} name - Numele cookie-ului căutat.
 * @returns {string|null} Valoarea cookie-ului sau null dacă nu există.
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

/**
 * Șterge un cookie după nume.
 * @param {string} name - Numele cookie-ului de șters.
 */
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    console.log(`[COOKIE] Șters cookie "${name}".`);
}

/**
 * Șterge toate cookie-urile setate pe site.
 */
function deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        deleteCookie(name);
    }
    console.log("[COOKIE] Toate cookie-urile au fost șterse.");
}
