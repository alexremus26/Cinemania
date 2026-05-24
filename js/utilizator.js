const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');

const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
 * Clasa Utilizator - Gestionează datele de profil, validările, persistența în baza de date PostgreSQL,
 * controlul accesului bazat pe roluri (RBAC) și serviciul de e-mail.
 */
class Utilizator {
    /** @type {string} Configurație pentru tipul conexiunii active la BD. */
    static tipConexiune = "local";

    /** @type {string} Numele tabelului în baza de date asociat utilizatorilor. */
    static tabel = "utilizatori";

    /** @type {string} Cheia folosită ca salt pentru criptarea parolelor. */
    static parolaCriptare = "tehniciweb";

    /** @type {string} Adresa de email a serverului folosit de nodemailer. */
    static emailServer = "test.tweb.node@gmail.com";

    /** @type {number} Lungimea în bytes a codului parolei criptate. */
    static lungimeCod = 64;

    /** @type {string} Numele de domeniu folosit pentru generarea link-urilor de confirmare. */
    static numeDomeniu = "localhost:8080";

    /** 
     * @private
     * @type {string} 
     * Păstrează erorile interne de inițializare sau validare.
     */
    #eroare;

    /**
     * Constructor pentru clasa Utilizator.
     * Setează proprietățile din obiectul dat ca parametru, cu suport pentru valori implicite.
     * @param {object} [param={}] - Proprietățile inițiale ale contului
     * @param {number} [param.id] - ID-ul unic în BD
     * @param {string} [param.username] - Numele unic de utilizator
     * @param {string} [param.nume] - Numele de familie
     * @param {string} [param.prenume] - Prenumele utilizatorului
     * @param {string} [param.email] - Adresa de email a utilizatorului
     * @param {string} [param.parola] - Parola (brută sau hash-uită)
     * @param {string|object} [param.rol] - Rolul (codul de rol sau obiectul deja instanțiat)
     * @param {string} [param.culoare_chat="black"] - Culoarea preferată pentru chat
     * @param {string} [param.poza] - Calea către avatar
     */
    constructor({ id, username, nume, prenume, email, parola, rol, culoare_chat = "black", poza } = {}) {
        this.id = id;

        try {
            if (username) {
                if (this.checkUsername(username)) {
                    this.username = username;
                } else {
                    throw new Error("Username incorect");
                }
            }
        } catch (e) {
            this.#eroare = e.message;
        }

        if (arguments[0]) {
            for (let prop in arguments[0]) {
                this[prop] = arguments[0][prop];
            }
        }

        if (this.rol) {
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
        }

        this.#eroare = "";
    }

    /**
     * Verifică dacă numele respectă formatul cerut (doar litere, începe cu majusculă).
     * @param {string} nume - Numele de verificat
     * @returns {boolean} True dacă numele este valid, altfel false
     */
    checkName(nume) {
        return typeof nume === 'string' && nume !== "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    /**
     * Metodă de verificare a numelui cerută explicit de barem.
     * @param {string} nume - Numele de verificat
     * @returns {boolean} True dacă numele respectă formatul, altfel false
     */
    verificaNume(nume) {
        return this.checkName(nume);
    }

    /**
     * Setter pentru nume. Aruncă eroare dacă formatul este greșit.
     * @param {string} nume - Noul nume
     * @throws {Error} Dacă numele nu respectă formatul valid
     */
    set setareNume(nume) {
        if (this.checkName(nume)) {
            this.nume = nume;
        } else {
            throw new Error("Nume gresit");
        }
    }

    /**
     * Setter pentru username. Aruncă eroare dacă formatul este greșit.
     * @param {string} username - Noul username
     * @throws {Error} Dacă username-ul nu respectă formatul valid
     */
    set setareUsername(username) {
        if (this.checkUsername(username)) {
            this.username = username;
        } else {
            throw new Error("Username gresit");
        }
    }

    /**
     * Verifică dacă username-ul conține exclusiv caracterele permise.
     * @param {string} username - Username-ul de verificat
     * @returns {boolean} True dacă username-ul este valid, altfel false
     */
    checkUsername(username) {
        return typeof username === 'string' && username !== "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    /**
     * Metodă de verificare a username-ului cerută explicit de barem.
     * @param {string} username - Username-ul de verificat
     * @returns {boolean} True dacă respectă formatul, altfel false
     */
    verificaUsername(username) {
        return this.checkUsername(username);
    }

    /**
     * Criptează parola primită prin algoritmul scryptSync cu cheia de criptare a clasei.
     * @param {string} parola - Parola brută de criptat
     * @returns {string} Parola criptată hexazecimal
     */
    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    /**
     * Salvează utilizatorul în baza de date. Criptează parola, generează tokenul
     * și trimite un mail de confirmare la succes.
     * Aruncă eroare dacă username-ul deja există în baza de date (cerință barem).
     * @throws {Error} Dacă utilizatorul există deja
     */
    salvareUtilizator() {
        let utiliz = this;
        let db = AccesBD.getInstanta(Utilizator.tipConexiune);
        
        db.select({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: [`username = '${this.username}'`]
        }, function(err, rezSelect) {
            if (err) {
                console.error(err);
                return;
            }
            if (rezSelect.rowCount > 0) {
                throw new Error("Eroare salvareUtilizator: Username-ul deja exista!");
            }

            let parolaCriptata = Utilizator.criptareParola(utiliz.parola);
            let token = parole.genereazaToken(100);
            db.insert({
                tabel: Utilizator.tabel,
                campuri: {
                    username: utiliz.username,
                    nume: utiliz.nume,
                    prenume: utiliz.prenume,
                    parola: parolaCriptata,
                    email: utiliz.email,
                    culoare_chat: utiliz.culoare_chat,
                    cod: token,
                    poza: utiliz.poza
                }
            }, function(err2, rez) {
                if (err2) {
                    console.log(err2);
                } else {
                    utiliz.trimiteMail(
                        "Te-ai inregistrat cu succes",
                        "Username-ul tau este " + utiliz.username,
                        `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`
                    );
                }
            });
        });
    }

    /**
     * Modifică câmpurile utilizatorului în baza de date.
     * @param {object} obiectNou - Proprietățile noi de actualizat în BD
     * @returns {Promise<any>} Rezultatul query-ului de tip Promise
     * @throws {Error} Dacă utilizatorul nu există în baza de date
     */
    async modifica(obiectNou) {
        if (!this.id && !this.username) {
            throw new Error("Nu se poate modifica: lipseste identificatorul utilizatorului!");
        }
        let db = AccesBD.getInstanta(Utilizator.tipConexiune);
        let conditie = this.id ? `id = ${this.id}` : `username = '${this.username}'`;

        let rezSelect = await db.selectAsync({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: [conditie]
        });
        if (rezSelect.rowCount === 0) {
            throw new Error("Eroare modifica: Utilizatorul nu exista!");
        }

        Object.assign(this, obiectNou);

        let campuri = Object.keys(obiectNou);
        let valori = Object.values(obiectNou);

        return new Promise((resolve, reject) => {
            db.update({
                tabel: Utilizator.tabel,
                campuri: campuri,
                valori: valori,
                conditiiAnd: [conditie]
            }, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    /**
     * Șterge utilizatorul curent din tabel.
     * @returns {Promise<any>} Promisiune ce returnează rezultatul ștergerii
     * @throws {Error} Dacă utilizatorul nu există în baza de date
     */
    async sterge() {
        if (!this.id && !this.username) {
            throw new Error("Nu se poate sterge: lipseste identificatorul utilizatorului!");
        }
        let db = AccesBD.getInstanta(Utilizator.tipConexiune);
        let conditie = this.id ? `id = ${this.id}` : `username = '${this.username}'`;

        let rezSelect = await db.selectAsync({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: [conditie]
        });
        if (rezSelect.rowCount === 0) {
            throw new Error("Eroare sterge: Utilizatorul nu exista!");
        }

        return new Promise((resolve, reject) => {
            db.delete({
                tabel: Utilizator.tabel,
                conditiiAnd: [conditie]
            }, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    /**
     * Căutare sincronă (cu callback) utilizatori conform unor criterii din obParam.
     * @param {object} obParam - Proprietăți ale utilizatorului după care se face căutarea
     * @param {function} callback - Callback de tipul function(err, listaUtiliz)
     */
    static cauta(obParam, callback) {
        let db = AccesBD.getInstanta(Utilizator.tipConexiune);
        let conditiiAnd = [];

        Object.entries(obParam).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                if (typeof val === 'string') {
                    conditiiAnd.push(`${key} = '${val}'`);
                } else if (typeof val === 'number' || typeof val === 'boolean') {
                    conditiiAnd.push(`${key} = ${val}`);
                }
            }
        });

        db.select({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: conditiiAnd
        }, (err, rezSelect) => {
            if (err) {
                callback(err, null);
            } else {
                let listaUtiliz = (rezSelect.rows || []).map(row => new Utilizator(row));
                callback(null, listaUtiliz);
            }
        });
    }

    /**
     * Căutare asincronă utilizatori conform unor criterii din obParam.
     * @param {object} obParam - Proprietăți ale utilizatorului după care se face căutarea
     * @returns {Promise<Utilizator[]>} Listă de obiecte Utilizator care corespund criteriilor
     */
    static async cautaAsync(obParam) {
        let db = AccesBD.getInstanta(Utilizator.tipConexiune);
        let conditiiAnd = [];

        Object.entries(obParam).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                if (typeof val === 'string') {
                    conditiiAnd.push(`${key} = '${val}'`);
                } else if (typeof val === 'number' || typeof val === 'boolean') {
                    conditiiAnd.push(`${key} = ${val}`);
                }
            }
        });

        let rezSelect = await db.selectAsync({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: conditiiAnd
        });

        return (rezSelect.rows || []).map(row => new Utilizator(row));
    }

    /**
     * Trimite un email către utilizatorul curent.
     * @param {string} subiect - Subiectul e-mailului
     * @param {string} mesajText - Conținutul ca plain text
     * @param {string} mesajHtml - Conținutul formatat HTML
     * @param {object[]} [atasamente=[]] - Listă opțională de atașamente
     */
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {
                user: Utilizator.emailServer,
                pass: "rwgmgkldxnarxrgu"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email,
            subject: subiect,
            text: mesajText,
            html: mesajHtml,
            attachments: atasamente
        });
        console.log("trimis mail");
    }
   
    /**
     * Căutare asincronă după username care returnează o instanță Utilizator.
     * @param {string} username - Username-ul căutat
     * @returns {Promise<Utilizator|null>} Instanța utilizatorului sau null dacă nu există
     */
    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({
                tabel: "utilizatori",
                campuri: ['*'],
                conditiiAnd: [`username='${username}'`]
            });
            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0]);
            } else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Căutare sincronă (cu callback) după username.
     * @param {string} username - Username-ul căutat
     * @param {object} obparam - Obiect suplimentar transmis către callback (de ex. parola trimisă la login)
     * @param {function} proceseazaUtiliz - Callback: function(utilizator, obparam, eroare)
     */
    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;
        let eroare = null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({
            tabel: "utilizatori",
            campuri: ['*'],
            conditiiAnd: [`username='${username}'`]
        }, function(err, rezSelect) {
            if (err) {
                console.error("Utilizator:", err);
                eroare = -2;
            } else if (rezSelect.rowCount == 0) {
                eroare = -1;
            }
            let u = new Utilizator(rezSelect.rows[0]);
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    /**
     * Verifică dacă utilizatorul are un anumit drept (privilegiu) în funcție de rol.
     * @param {Symbol} drept - Simbolul din drepturi.js
     * @returns {boolean} True dacă utilizatorul are dreptul, altfel false
     */
    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}

module.exports = { Utilizator: Utilizator };
