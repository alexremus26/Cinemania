const { Pool } = require('pg');


class AccesBD {
    /**
     * @type {AccesBD|null}
     * Proprietate statică care va conține unica instanță a clasei.
     */
    static instanta = null;

    /**
     * @private
     * @type {Pool|null}
     * Proprietate privată pentru clientul de conexiune.
     */
    _client = null;

    /**
     * Constructor Singleton. Aruncă eroare dacă deja a fost instanțiată.
     * @throws {Error} Dacă clasa a fost deja instanțiată anterior.
     */
    constructor() {
        if (AccesBD.instanta) {
            throw new Error("[AccesBD Error] Clasa AccesBD este un Singleton și a fost deja instanțiată!");
        }
        AccesBD.instanta = this;
    }

    /**
     * Getter pentru clientul/pool-ul de conexiune.
     * @returns {Pool|null} Instanța de Pool pg
     */
    get client() {
        return this._client;
    }

    /**
     * Inițializează pool-ul de conexiuni către baza de date.
     * @param {string} user - Numele de utilizator DB
     * @param {string} password - Parola DB
     * @param {string} database - Numele bazei de date
     * @param {string} [host='localhost'] - Adresa host a serverului DB
     * @param {number} [port=5432] - Portul serverului DB
     */
    initializare(user, password, database, host = 'localhost', port = 5432) {
        this._client = new Pool({
            user,
            password,
            database,
            host,
            port
        });
        console.log(`[AccesBD] Pool-ul de conexiuni s-a inițializat cu succes pentru baza "${database}" pe portul ${port}.`);
    }

    /**
     * Metodă statică ce implementează pattern-ul Singleton.
     * Creează instanța unică dacă nu există și o inițializează cu datele implicite.
     * @returns {AccesBD} Referința către instanța unică
     */
    static getInstanta() {
        if (!AccesBD.instanta) {
            AccesBD.instanta = new AccesBD();
            AccesBD.instanta.initializare(
                process.env.DB_USER || 'cinemania_user',
                process.env.DB_PASSWORD || 'cinemania_pass',
                process.env.DB_NAME || 'cinemania',
                process.env.DB_HOST || 'localhost',
                process.env.DB_PORT || 5432
            );
        }
        return AccesBD.instanta;
    }

    /**
     * Interogare SELECT clasică cu callback.
     * @param {object} obiect - Configurație select
     * @param {string} obiect.tabel - Numele tabelului
     * @param {string[]} [obiect.campuri] - Vector de campuri de selectat
     * @param {string[]} [obiect.conditii] - Vector cu conditii WHERE de tip string
     * @param {string[]} [obiect.conditiiAnd] - Vector cu conditii WHERE alternat
     * @param {function} callback - Callback de tipul function(err, rezSelect)
     */
    select(obiect, callback) {
        try {
            const campuriStr = (obiect.campuri && obiect.campuri.length > 0) ? obiect.campuri.join(', ') : '*';
            let sql = `SELECT ${campuriStr} FROM ${obiect.tabel}`;
            const conditii = obiect.conditiiAnd || obiect.conditii;
            if (conditii && conditii.length > 0) {
                sql += ` WHERE ${conditii.join(' AND ')}`;
            }

            // query e metoda postgres , tine clientu/useru si parola
            // err, res - callback intern
            this._client.query(sql, (err, res) => {
                if (err) {
                    callback(err, null);
                    // un fel de return care tine cont de operatii care trb sa astepte/asincron
                } else {
                    callback(null, res);
                }
            });
        } catch (e) {
            callback(e, null);
        }
    }

    /**
     * Interogare SELECT asincronă care returnează o Promisiune.
     * @param {object} obiect - Configurație select
     * @param {string} obiect.tabel - Numele tabelului
     * @param {string[]} [obiect.campuri] - Vector de campuri de selectat
     * @param {string[]} [obiect.conditii] - Vector cu conditii WHERE de tip string
     * @param {string[]} [obiect.conditiiAnd] - Vector cu conditii WHERE alternat
     * @returns {Promise<object>} Obiectul res din pg (contine .rows si .rowCount)
     */
    async selectAsync(obiect) {
        const campuriStr = (obiect.campuri && obiect.campuri.length > 0) ? obiect.campuri.join(', ') : '*';
        let sql = `SELECT ${campuriStr} FROM ${obiect.tabel}`;
        const conditii = obiect.conditiiAnd || obiect.conditii;
        if (conditii && conditii.length > 0) {
            sql += ` WHERE ${conditii.join(' AND ')}`;
        }

        const res = await this._client.query(sql);
        return res;
    }

    /**
     * Interogare UPDATE cu callback.
     * @param {object} obiect - Configurație update
     * @param {string} obiect.tabel - Numele tabelului
     * @param {string[]} obiect.campuri - Vector cu câmpurile de setat
     * @param {any[]} obiect.valori - Vector cu valorile de setat
     * @param {string[]} [obiect.conditii] - Vector cu condițiile WHERE
     * @param {string[]} [obiect.conditiiAnd] - Vector cu condițiile WHERE alternat
     * @param {function} callback - Callback de tipul function(err, rez)
     */
    update(obiect, callback) {
        // 1. Construim bucata de "SET coloana1 = $1, coloana2 = $2" folosind o buclă clasică for
        let sets = [];
        for (let i = 0; i < obiect.campuri.length; i++) {
            sets.push(obiect.campuri[i] + " = $" + (i + 1));
        }

        // 2. Asamblăm query-ul de UPDATE
        let sql = "UPDATE " + obiect.tabel + " SET " + sets.join(", ");

        // 3. Adăugăm condiția WHERE dacă există
        if (obiect.conditiiAnd && obiect.conditiiAnd.length > 0) {
            sql += " WHERE " + obiect.conditiiAnd.join(" AND ");
        }

        // 4. Executăm interogarea în baza de date cu valorile corespunzătoare
        this._client.query(sql, obiect.valori, (err, res) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, res);
            }
        });
    }


    /**
     * Interogare INSERT cu callback.
     * @param {object} obiect - Configurație insert
     * @param {string} obiect.tabel - Numele tabelului
     * @param {string[]|object} obiect.campuri - Vector de câmpuri sau obiect key-value
     * @param {any[]} [obiect.valori] - Vector de valori corespunzătoare
     * @param {function} callback - Callback de tipul function(err, rez)
     */
    insert(obiect, callback) {
        let campuri = [];
        let valori = [];

        // 1. Verificăm dacă campuri este un vector clasic sau un obiect key-value
        if (Array.isArray(obiect.campuri)) {
            campuri = obiect.campuri;
            valori = obiect.valori;
        } else {
            // Cazul în care campuri este un obiect de tipul { username: 'maria', nume: 'Maria' }
            for (let cheie in obiect.campuri) {
                campuri.push(cheie);
                valori.push(obiect.campuri[cheie]);
            }
        }

        // 2. Generăm vectorul de placeholders ($1, $2, $3...) cu o buclă for clasică
        let placeholders = [];
        for (let i = 0; i < valori.length; i++) {
            placeholders.push("$" + (i + 1));
        }

        // 3. Asamblăm query-ul SQL de tip INSERT
        let sql = "INSERT INTO " + obiect.tabel + " (" + campuri.join(", ") + ") VALUES (" + placeholders.join(", ") + ") RETURNING *";

        // 4. Executăm interogarea în baza de date
        this._client.query(sql, valori, (err, res) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, res);
            }
        });
    }

    /**
     * Interogare DELETE cu callback.
     * @param {object} obiect - Configurație delete
     * @param {string} obiect.tabel - Numele tabelului
     * @param {string[]} [obiect.conditii] - Vector cu condiții WHERE
     * @param {string[]} [obiect.conditiiAnd] - Vector cu condiții WHERE alternat
     * @param {function} callback - Callback de tipul function(err, rez)
     */
    delete(obiect, callback) {
        try {
            let sql = `DELETE FROM ${obiect.tabel}`;
            const conditii = obiect.conditiiAnd || obiect.conditii;
            if (conditii && conditii.length > 0) {
                sql += ` WHERE ${conditii.join(' AND ')}`;
            }

            this._client.query(sql, (err, res) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res);
                }
            });
        } catch (e) {
            callback(e, null);
        }
    }
}

module.exports = AccesBD;
