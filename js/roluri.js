const Drepturi = require('./drepturi');

/**
 * Clasa de bază Rol reprezintă comportamentul comun pentru
 * controlul accesului bazat pe drepturi (RBAC).
 */
class Rol {
    /**
     * @param {string} cod - Identificatorul rolului în baza de date (ex: 'admin', 'comun')
     */
    constructor(cod) {
        this.cod = cod;
    }

    /**
     * Getter abstract pentru lista de drepturi (Symbol).
     * Subclasele vor suprascrie acest getter.
     * @returns {Symbol[]}
     */
    get drepturi() {
        return [];
    }

    /**
     * Verifică dacă rolul are dreptul specificat ca parametru.
     * @param {Symbol} drept 
     * @returns {boolean}
     */
    areDreptul(drept) {
        return this.drepturi.includes(drept);
    }
}

/**
 * Rolul RolClient (corespunzător clienților logați pe site)
 */
class RolClient extends Rol {
    constructor() {
        super("comun");
    }

    /**
     * Clienții au doar drepturi de vizualizare produse și cumpărare produse/bilete.
     */
    get drepturi() {
        return [
            Drepturi.vizualizareProduse,
            Drepturi.cumparareProduse
        ];
    }
}

/**
 * Rolul RolAdmin (corespunzător administratorilor site-ului)
 */
class RolAdmin extends Rol {
    constructor() {
        super("admin");
    }

    /**
     * Administratorul are absolut toate drepturile din sistem.
     */
    get drepturi() {
        return Object.values(Drepturi);
    }
}

/**
 * Rolul RolModerator (corespunzător moderatorilor site-ului)
 */
class RolModerator extends Rol {
    constructor() {
        super("moderator");
    }

    /**
     * Moderatorul are drepturi de gestiune utilizatori (vizualizare, modificare, ștergere),
     * dar NU are drepturi asupra produselor (vizualizare/modificare/adăugare/ștergere)
     * și nici nu poate cumpăra produse.
     */
    get drepturi() {
        return [
            Drepturi.vizualizareUtilizatori,
            Drepturi.modificareUtilizatori,
            Drepturi.stergereUtilizatori
        ];
    }
}

/**
 * Clasa RolFactory implementează design pattern-ul Factory
 * pentru crearea dinamică a instanțelor de roluri pe baza string-ului cod.
 */
class RolFactory {
    /**
     * Creează un obiect Rol corespunzător tipului oferit.
     * @param {string} tip - Codul rolului
     * @returns {Rol}
     */
    static creeazaRol(tip) {
        const tipCurat = String(tip).toLowerCase().trim();
        switch (tipCurat) {
            case "admin":
                return new RolAdmin();
            case "comun":
            case "client":
            case "comun_user":
                return new RolClient();
            case "moderator":
                return new RolModerator();
            default:
                throw new Error(`[RolFactory Error] Tipul de rol "${tip}" nu este recunoscut!`);
        }
    }
}

// Exportăm clasele de bază și Factory conform cerinței
module.exports = {
    Rol,
    RolClient,
    RolAdmin,
    RolModerator,
    RolFactory
};
