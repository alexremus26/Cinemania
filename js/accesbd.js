const { Pool } = require('pg');

/**
 * Clasa AccesBD implementează design pattern-ul Singleton
 * și oferă metode pentru accesul uniform la baza de date PostgreSQL.
 */
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
    _client = null; 2

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
        try {
            if (obiect.campuri.length !== obiect.valori.length) {
                throw new Error("Vectorul de câmpuri și cel de valori trebuie să aibă lungimi egale!");
            }

            const sets = obiect.campuri.map((c, i) => `${c} = $${i + 1}`).join(', ');
            let sql = `UPDATE ${obiect.tabel} SET ${sets}`;
            const conditii = obiect.conditiiAnd || obiect.conditii;
            if (conditii && conditii.length > 0) {
                sql += ` WHERE ${conditii.join(' AND ')}`;
            }

            this._client.query(sql, obiect.valori, (err, res) => {
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

    /**
     * Interogare INSERT cu callback.
     * Suportă atât formatul cu campuri[] și valori[], cât și cel tip obiect key-value.
     * @param {object} obiect - Configurație insert
     * @param {string} obiect.tabel - Numele tabelului
     * @param {string[]|object} obiect.campuri - Câmpurile sau obiectul key-value
     * @param {any[]} [obiect.valori] - Valorile corespunzătoare
     * @param {function} callback - Callback de tipul function(err, rez)
     */
    insert(obiect, callback) {
        try {
            let campuri = [];
            let valori = [];

            if (obiect.campuri && !Array.isArray(obiect.campuri)) {
                const keys = Object.keys(obiect.campuri);
                campuri = keys;
                valori = keys.map(k => obiect.campuri[k]);
            } else if (Array.isArray(obiect.campuri) && Array.isArray(obiect.valori)) {
                campuri = obiect.campuri;
                valori = obiect.valori;
            } else {
                const keys = Object.keys(obiect).filter(k => k !== 'tabel');
                campuri = keys;
                valori = keys.map(k => obiect[k]);
            }

            const placeholders = valori.map((_, i) => `$${i + 1}`).join(', ');
            const sql = `INSERT INTO ${obiect.tabel} (${campuri.join(', ')}) VALUES (${placeholders}) RETURNING *`;

            this._client.query(sql, valori, (err, res) => {
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
