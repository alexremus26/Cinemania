const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const obGlobal = {
    obErori: null
};

const vect_foldere = ['temp', 'logs', 'backup', 'fisiere_uploadate'];

vect_foldere.forEach((numeFolder) => {
    const caleFolder = path.join(__dirname, numeFolder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
    }
});

function toClientImagePath(basePath, imagePath) {
    if (!imagePath) {
        return '';
    }

    if (imagePath.startsWith('/')) {
        return imagePath;
    }

    return path.posix.join(basePath, imagePath);
}

function initErori() {
    const jsonPath = path.join(__dirname, 'erori.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const obErori = JSON.parse(jsonContent);
    const basePath = obErori.cale_baza.startsWith('/') ? obErori.cale_baza : `/${obErori.cale_baza}`;

    obErori.cale_baza = basePath;
    obErori.eroare_default.imagine = toClientImagePath(basePath, obErori.eroare_default.imagine);

    obErori.info_erori.forEach((eroare) => {
        eroare.imagine = toClientImagePath(basePath, eroare.imagine);
    });

    obGlobal.obErori = obErori;
}

function afisareEroare(res, identificator, titlu, text, imagine) {
    const obErori = obGlobal.obErori;
    const idNumeric = Number(identificator);
    const areIdValid = Number.isInteger(idNumeric);

    let eroareSelectata = obErori.eroare_default;

    if (areIdValid) {
        const eroareGasita = obErori.info_erori.find((eroare) => Number(eroare.identificator) === idNumeric);
        if (eroareGasita) {
            eroareSelectata = eroareGasita;
        }
    }

    const titluFinal = titlu ?? eroareSelectata.titlu;
    const textFinal = text ?? eroareSelectata.text;
    const imagineFinala = imagine ?? eroareSelectata.imagine;

    let statusCode = 200;
    if (eroareSelectata.status === true && areIdValid) {
        statusCode = idNumeric;
    }

    res.status(statusCode).render('pagini/eroare', {
        titlu: titluFinal,
        text: textFinal,
        imagine: imagineFinala
    });
}

initErori();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.ipUtilizator = req.ip;
    next();
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'resurse', 'imagini', 'favicon', 'favicon.ico'));
});

app.use((req, res, next) => {
    if (req.path.toLowerCase().endsWith('.ejs')) {
        return afisareEroare(res, 400);
    }
    return next();
});

app.use('/resurse', (req, res, next) => {
    const caleResurse = path.join(__dirname, 'resurse');
    const caleCeruta = path.normalize(path.join(caleResurse, req.path));

    if (!caleCeruta.startsWith(caleResurse)) {
        return afisareEroare(res, 403);
    }

    if (fs.existsSync(caleCeruta)) {
        const stat = fs.statSync(caleCeruta);
        if (stat.isDirectory()) {
            return afisareEroare(res, 403);
        }
    }

    return next();
});

app.use('/resurse', express.static(path.join(__dirname, 'resurse')));

app.get(['/index', '/index.html', '/index.ejs'], (req, res) => {
    res.redirect('/');
});

app.get(['/', '/index', '/home'], (req, res) => {
    res.render('pagini/index');
});

app.get('/*splat', (req, res) => {
    const paginaCeruta = req.path.replace(/^\/+/g, '').replace(/\/+$/g, '');

    if (!paginaCeruta) {
        return res.redirect('/');
    }

    res.render(path.join('pagini', paginaCeruta), (eroare, rezultatRandare) => {
        if (eroare) {
            if (eroare.message && eroare.message.startsWith('Failed to lookup view')) {
                return afisareEroare(res, 404);
            }

            return afisareEroare(res);
        }

        return res.send(rezultatRandare);
    });
});

app.listen(PORT, () => {
    console.log(`Serverul rulează la adresa: http://localhost:${PORT}`);
});