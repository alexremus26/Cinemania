const express = require('express');
const fs = require('fs');
const path = require('path');
const sass = require('sass');
const sharp = require('sharp');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'cinemania_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'cinemania',
    password: process.env.DB_PASSWORD || 'cinemania_pass',
    port: process.env.DB_PORT || 5432,
});

let categoriiFilme = [];
pool.query("SELECT unnest(enum_range(NULL::gen_film)) AS categorie")
    .then(res => { categoriiFilme = res.rows.map(r => r.categorie); })
    .catch(err => console.error('[DB] Eroare la preluarea categoriilor (asigură-te că BD este pornită și configurată):', err));

const app = express();
const PORT = 8080;
const obGlobal = {
    obErori: null,
    obGalerie: null,
    folderScss: path.join(__dirname, 'scss'),
    folderCss: path.join(__dirname, 'resurse', 'stiluri')
};

const vect_foldere = ['temp', 'logs', 'backup', 'fisiere_uploadate', 'backup/resurse/css'];

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

// Compilare automata scss (0.25p)
function compileazaScss(caleScss, caleCss) {
    try {
        // Resolve paths
        const pathScss = path.isAbsolute(caleScss) ? caleScss : path.join(obGlobal.folderScss, caleScss);
        let pathCss = caleCss ? (path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss)) : null;
        
        // Auto-derive CSS filename if not provided
        if (!pathCss) {
            const nameNoExt = path.parse(caleScss).name;
            pathCss = path.join(obGlobal.folderCss, `${nameNoExt}.css`);
        }
        
        // Backup old CSS if it exists
        if (fs.existsSync(pathCss)) {
            const backupDir = path.join(__dirname, 'backup', 'resurse', 'css');
            const parsedCssPath = path.parse(pathCss);
            const timestamp = Date.now();
            const cssFileName = `${parsedCssPath.name}_${timestamp}${parsedCssPath.ext}`;
            const backupPath = path.join(backupDir, cssFileName);
            
            try {
                // Ensure backup directory exists
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                
                fs.copyFileSync(pathCss, backupPath);
                console.log(`[SCSS] Backed up: ${cssFileName}`);
            } catch (backupError) {
                console.error(`[SCSS ERROR] Failed to backup ${cssFileName}:`, backupError.message);
            }
        }
        
        // Compile SCSS to CSS
        const result = sass.compile(pathScss, {
            style: 'compressed',
            loadPaths: [obGlobal.folderScss, path.join(__dirname, 'node_modules')],
            quietDeps: true
        });
        
        // Write CSS file
        fs.writeFileSync(pathCss, result.css);
        console.log(`[SCSS] Compiled: ${path.relative(__dirname, pathScss)} → ${path.basename(pathCss)}`);
    } catch (error) {
        console.error(`[SCSS ERROR] Failed to compile ${caleScss}:`, error.message);
    }
}

function compileAllScss() {
    try {
        const files = fs.readdirSync(obGlobal.folderScss);
        const scssFiles = files.filter(f => f.endsWith('.scss') && !f.startsWith('_'));
        
        if (scssFiles.length === 0) {
            console.log('[SCSS] No SCSS files to compile.');
            return;
        }
        
        scssFiles.forEach(file => {
            compileazaScss(file, null);
        });
        
        console.log(`[SCSS] Compiled ${scssFiles.length} SCSS file(s).`);
    } catch (error) {
        console.error('[SCSS ERROR] Failed to compile all SCSS files:', error.message);
    }
}

function watchScssFolder() {
    console.log('[SCSS] Watching folder for changes:', obGlobal.folderScss);
    
    fs.watch(obGlobal.folderScss, (eventType, filename) => {
        if (filename && filename.endsWith('.scss')) {
            console.log(`[SCSS] File changed: ${filename}`);
            // Debounce by adding small delay
            setTimeout(() => {
                compileazaScss(filename, null);
            }, 100);
        }
    });
}

/**
 * verificareEroriJson()
 * Validates the erori.json file at server startup.
 * Checks A–G cover structural integrity, file system consistency,
 * duplicate key detection, and duplicate identifier detection.
 */
function verificareEroriJson() {
    const jsonPath = path.join(__dirname, 'erori.json');
    let continutBrut;
    let obJson;

    // [A] Verificare: fisierul erori.json nu exista (0.025p)
    // Daca fisierul lipseste, afisam mesaj detaliat si oprim aplicatia.
    if (!fs.existsSync(jsonPath)) {
        console.error('==============================================================');
        console.error('[EROARE CRITICA - A] Fisierul "erori.json" nu a fost gasit!');
        console.error(`  Calea asteptata: ${jsonPath}`);
        console.error('  Aplicatia nu poate functiona fara acest fisier de configurare a erorilor.');
        console.error('  Creati fisierul erori.json in directorul radacina al proiectului');
        console.error('  cu proprietatile: cale_baza, eroare_default, info_erori.');
        console.error('==============================================================');
        process.exit(1);
    }

    // Citim continutul brut (string) pentru verificarea F
    continutBrut = fs.readFileSync(jsonPath, 'utf-8');

    try {
        obJson = JSON.parse(continutBrut);
    } catch (parseErr) {
        console.error('==============================================================');
        console.error('[EROARE - A] Fisierul "erori.json" nu contine JSON valid!');
        console.error(`  Detalii: ${parseErr.message}`);
        console.error('==============================================================');
        process.exit(1);
    }

    // [B] Verificare: lipsesc proprietati obligatorii (info_erori, cale_baza, eroare_default) (0.025p)
    // Verificam existenta fiecareia din cele 3 proprietati de baza ale fisierului.
    const proprietatiObligatorii = ['info_erori', 'cale_baza', 'eroare_default'];
    const proprietatiLipsa = proprietatiObligatorii.filter(prop => !(prop in obJson));

    if (proprietatiLipsa.length > 0) {
        console.error('==============================================================');
        console.error('[EROARE - B] Fisierul "erori.json" nu contine toate proprietatile obligatorii!');
        proprietatiLipsa.forEach(prop => {
            console.error(`  ✗ Proprietatea "${prop}" lipseste din fisier.`);
        });
        console.error(`  Proprietati necesare: ${proprietatiObligatorii.join(', ')}`);
        console.error('==============================================================');
    }

    // [C] Verificare: eroare_default nu are titlu, text sau imagine (0.025p)
    // Daca eroare_default exista, verificam ca are toate cele 3 sub-proprietati necesare.
    if (obJson.eroare_default) {
        const propDefault = ['titlu', 'text', 'imagine'];
        const propDefaultLipsa = propDefault.filter(prop => !(prop in obJson.eroare_default));

        if (propDefaultLipsa.length > 0) {
            console.error('==============================================================');
            console.error('[EROARE - C] Obiectul "eroare_default" nu contine toate proprietatile necesare!');
            propDefaultLipsa.forEach(prop => {
                console.error(`  ✗ Proprietatea "${prop}" lipseste din eroare_default.`);
            });
            console.error(`  Proprietati necesare in eroare_default: ${propDefault.join(', ')}`);
            console.error('==============================================================');
        }
    }

    // [D] Verificare: folderul cale_baza nu exista in sistemul de fisiere (0.025p)
    // Rezolvam calea relativa la directorul proiectului si verificam existenta.
    if (obJson.cale_baza) {
        const caleBazaRelatia = obJson.cale_baza.startsWith('/') ? obJson.cale_baza.substring(1) : obJson.cale_baza;
        const caleBazaAbsoluta = path.join(__dirname, caleBazaRelatia);

        if (!fs.existsSync(caleBazaAbsoluta)) {
            console.error('==============================================================');
            console.error('[EROARE - D] Folderul specificat in "cale_baza" nu exista pe disc!');
            console.error(`  Valoarea din JSON: "${obJson.cale_baza}"`);
            console.error(`  Calea absoluta verificata: ${caleBazaAbsoluta}`);
            console.error('  Creati folderul sau corectati valoarea "cale_baza" din erori.json.');
            console.error('==============================================================');
        }
    }

    // [E] Verificare: fisiere imagine asociate erorilor nu exista pe disc (0.05p)
    // Verificam imaginea din eroare_default si imaginile din fiecare eroare din info_erori.
    if (obJson.cale_baza) {
        const caleBazaRelatia = obJson.cale_baza.startsWith('/') ? obJson.cale_baza.substring(1) : obJson.cale_baza;
        const caleBazaAbsoluta = path.join(__dirname, caleBazaRelatia);

        // Verificam imaginea din eroare_default
        if (obJson.eroare_default && obJson.eroare_default.imagine) {
            const caleImagineDefault = path.join(caleBazaAbsoluta, path.basename(obJson.eroare_default.imagine));
            if (!fs.existsSync(caleImagineDefault)) {
                console.error('==============================================================');
                console.error('[EROARE - E] Imaginea din eroare_default nu exista pe disc!');
                console.error(`  Imagine: "${obJson.eroare_default.imagine}"`);
                console.error(`  Calea verificata: ${caleImagineDefault}`);
                console.error('==============================================================');
            }
        }

        // Verificam imaginile din fiecare eroare din info_erori
        if (Array.isArray(obJson.info_erori)) {
            obJson.info_erori.forEach((eroare, index) => {
                if (eroare.imagine) {
                    const caleImagine = path.join(caleBazaAbsoluta, path.basename(eroare.imagine));
                    if (!fs.existsSync(caleImagine)) {
                        console.error('==============================================================');
                        console.error(`[EROARE - E] Imaginea pentru eroarea cu identificatorul ${eroare.identificator || `(index ${index})`} nu exista pe disc!`);
                        console.error(`  Imagine: "${eroare.imagine}"`);
                        console.error(`  Calea verificata: ${caleImagine}`);
                        console.error('==============================================================');
                    }
                }
            });
        }
    }

    // [F] Verificare: proprietate specificata de mai multe ori in acelasi obiect JSON (0.2p)
    // JSON.parse() ignora cheile duplicate (pastreaza ultima valoare), asa ca trebuie sa
    // parcurgem string-ul brut caracter cu caracter, urmarind nivelul de acolade,
    // si sa extragem cheile din fiecare obiect la fiecare nivel de adancime.
    (function verificareCheiiDuplicate() {
        // Parsam manual string-ul JSON, caracter cu caracter
        // Tinem un stack de obiecte; fiecare nivel de adancime are propriul set de chei
        const stackChei = [];         // stack de Map<string, number> (cheie -> numar aparitii)
        const stackContext = [];      // stack de string-uri ce descriu contextul curent
        let inString = false;
        let escapeNext = false;
        let currentKey = '';
        let collectingKey = false;
        let lastExtractedKey = '';
        let foundDuplicates = false;
        let afterColon = false;

        for (let i = 0; i < continutBrut.length; i++) {
            const ch = continutBrut[i];

            if (escapeNext) {
                if (collectingKey) currentKey += ch;
                escapeNext = false;
                continue;
            }

            if (ch === '\\') {
                escapeNext = true;
                if (collectingKey) currentKey += ch;
                continue;
            }

            if (ch === '"') {
                if (!inString) {
                    inString = true;
                    if (!afterColon && stackChei.length > 0) {
                        // Incepem sa colectam o cheie
                        collectingKey = true;
                        currentKey = '';
                    }
                } else {
                    inString = false;
                    if (collectingKey) {
                        collectingKey = false;
                        lastExtractedKey = currentKey;
                    }
                }
                continue;
            }

            if (inString) {
                if (collectingKey) currentKey += ch;
                continue;
            }

            // In afara string-ului
            if (ch === ':') {
                // Am gasit o cheie completa
                afterColon = true;
                if (stackChei.length > 0 && lastExtractedKey) {
                    const nivel = stackChei[stackChei.length - 1];
                    const count = (nivel.get(lastExtractedKey) || 0) + 1;
                    nivel.set(lastExtractedKey, count);

                    if (count > 1) {
                        foundDuplicates = true;
                        const context = stackContext[stackContext.length - 1] || 'radacina';
                        console.error('==============================================================');
                        console.error(`[EROARE - F] Proprietatea "${lastExtractedKey}" apare de ${count} ori in acelasi obiect!`);
                        console.error(`  Context: ${context}`);
                        console.error(`  In fisierul: erori.json`);
                        console.error('  JSON.parse() va pastra doar ultima valoare, celelalte se pierd.');
                        console.error('==============================================================');
                    }
                    lastExtractedKey = '';
                }
            } else if (ch === '{') {
                afterColon = false;
                // Determinam contextul
                let context = 'obiectul radacina';
                if (stackChei.length > 0 && stackChei[stackChei.length - 1].size > 0) {
                    // Ultima cheie adaugata este contextul nostru
                    const cheileNivel = Array.from(stackChei[stackChei.length - 1].keys());
                    if (cheileNivel.length > 0) {
                        context = `obiectul din proprietatea "${cheileNivel[cheileNivel.length - 1]}"`;
                    }
                }
                stackChei.push(new Map());
                stackContext.push(context);
            } else if (ch === '}') {
                afterColon = false;
                stackChei.pop();
                stackContext.pop();
            } else if (ch === ',') {
                afterColon = false;
            } else if (ch === '[' || ch === ']') {
                afterColon = false;
            }
        }

        if (!foundDuplicates) {
            // Nu afisam nimic daca nu sunt chei duplicate — totul este ok
        }
    })();

    // [G] Verificare: erori cu acelasi identificator (0.15p)
    // Grupam erorile dupa identificator si afisam proprietatile (fara identificator)
    // pentru toate erorile care au acelasi identificator, ca sa fie usor de gasit.
    if (Array.isArray(obJson.info_erori)) {
        const grupeIdentificator = {};

        obJson.info_erori.forEach((eroare) => {
            const id = eroare.identificator;
            if (id === undefined) return;

            if (!grupeIdentificator[id]) {
                grupeIdentificator[id] = [];
            }
            grupeIdentificator[id].push(eroare);
        });

        Object.entries(grupeIdentificator).forEach(([id, erori]) => {
            if (erori.length > 1) {
                console.error('==============================================================');
                console.error(`[EROARE - G] Exista ${erori.length} erori cu identificatorul "${id}" in vectorul info_erori!`);
                console.error('  Proprietatile erorilor duplicate (fara identificator):');

                erori.forEach((eroare, index) => {
                    // Afisam toate proprietatile FARA identificator
                    const propFaraId = Object.entries(eroare)
                        .filter(([cheie]) => cheie !== 'identificator')
                        .map(([cheie, valoare]) => `${cheie}: "${valoare}"`)
                        .join(', ');
                    console.error(`    Eroarea ${index + 1}: [${propFaraId}]`);
                });

                console.error('  Fiecare eroare trebuie sa aiba un identificator unic.');
                console.error('==============================================================');
            }
        });
    }

    console.log('[VERIFICARE] Verificarea fisierului erori.json s-a incheiat.');
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

// Variable to mock the current date and time for testing the 4 gallery quarters
// Example: const GALERIE_TEST_DATE = new Date("2026-05-20T22:35:00"); // Quarter 3
const GALERIE_TEST_DATE = null;

async function asiguraImaginiDimensionate(imagine, basePath) {
    // TODO(security): Prevent directory traversal by sanitizing image filename using path.basename()
    const originalBasename = path.basename(imagine.cale_imagine);
    const originalPath = path.join(__dirname, 'resurse', 'imagini', originalBasename);
    
    const mediuDir = path.join(__dirname, 'resurse', 'imagini', 'mediu');
    const micDir = path.join(__dirname, 'resurse', 'imagini', 'mic');
    
    if (!fs.existsSync(mediuDir)) {
        fs.mkdirSync(mediuDir, { recursive: true });
    }
    if (!fs.existsSync(micDir)) {
        fs.mkdirSync(micDir, { recursive: true });
    }
    
    const mediuPath = path.join(mediuDir, originalBasename);
    const micPath = path.join(micDir, originalBasename);
    
    if (fs.existsSync(originalPath)) {
        try {
            if (!fs.existsSync(mediuPath)) {
                await sharp(originalPath)
                    .resize({ width: 300 })
                    .toFile(mediuPath);
            }
            if (!fs.existsSync(micPath)) {
                await sharp(originalPath)
                    .resize({ width: 150 })
                    .toFile(micPath);
            }
        } catch (error) {
            console.error(`Error generating resized images for ${originalBasename}:`, error);
        }
    }
}

async function filterGaleryByQuarter(date, obGalerie) {
    const targetDate = GALERIE_TEST_DATE || date;
    const minutes = targetDate.getMinutes();
    const currentQuarter = Math.floor(minutes / 15) + 1;
    
    if (!obGalerie || !obGalerie.imagini) {
        return [];
    }
    
    // Filter images matching current quarter
    const matchingImagini = obGalerie.imagini.filter(img => parseInt(img.sfert_ora) === currentQuarter);
    
    // Truncate to maximum 10 items
    const truncatedImagini = matchingImagini.slice(0, 10);
    
    // Asynchronously verify and generate medium/small dimensions using sharp
    for (const img of truncatedImagini) {
        await asiguraImaginiDimensionate(img, obGalerie.cale_galerie);
    }
    
    return truncatedImagini.map((imagine) => ({
        ...imagine,
        cale_galerie: obGalerie.cale_galerie,
        alt: imagine.alt || imagine.cale_imagine
    }));
}

const GALERIE_ANIMATA_CONFIG = {
    minCount: 5,
    maxCount: 11,
    perImageSeconds: 3.5,
    borderImage: '/resurse/imagini/cinematografe-harta.svg'
};

function getRandomOdd(min, max) {
    const minOdd = min % 2 === 0 ? min + 1 : min;
    const maxOdd = max % 2 === 0 ? max - 1 : max;

    if (minOdd > maxOdd) {
        return min;
    }

    const countOdds = Math.floor((maxOdd - minOdd) / 2) + 1;
    return minOdd + 2 * Math.floor(Math.random() * countOdds);
}

function buildGalerieAnimataItems() {
    try {
        const jsonPath = path.join(__dirname, 'resurse', 'documente', 'galerie.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const scaleGalerie = parsed.cale_galerie && parsed.cale_galerie.startsWith('/')
            ? parsed.cale_galerie
            : `/${parsed.cale_galerie || 'resurse/imagini'}`;

        const targetCount = getRandomOdd(GALERIE_ANIMATA_CONFIG.minCount, GALERIE_ANIMATA_CONFIG.maxCount);

        // Păstrăm doar filmele ale căror postere există fizic pe disc (evită link-urile stricate)
        const imaginiValide = (parsed.imagini || []).filter(img => {
            if (!img.cale_imagine) return false;
            const caleFizicaPoster = path.join(__dirname, 'resurse', 'imagini', img.cale_imagine);
            return fs.existsSync(caleFizicaPoster);
        });

        // Deduplicăm și luăm cele mai recente imagini din JSON (parcurgem de la sfârșit spre început)
        const seen = new Set();
        const itemsUnice = [];
        for (let i = imaginiValide.length - 1; i >= 0; i--) {
            const img = imaginiValide[i];
            if (!seen.has(img.cale_imagine)) {
                seen.add(img.cale_imagine);
                itemsUnice.push({
                    ...img,
                    cale_galerie: scaleGalerie,
                    alt: img.alt || img.cale_imagine
                });
            }
        }

        // Amestecăm aleatoriu imaginile pentru ca la fiecare refresh să apară poze diferite în ordine diferită
        const shuffled = itemsUnice.sort(() => Math.random() - 0.5);
        const items = shuffled.slice(0, targetCount);

        // Ne asigurăm că numărul de elemente rămâne impar
        if (items.length % 2 === 0 && items.length > 1) {
            items.pop();
        }

        if (items.length < GALERIE_ANIMATA_CONFIG.minCount) {
            console.warn(`[GALERIE ANIMATA] Not enough distinct images with posters on disk. Found ${items.length}, expected at least ${GALERIE_ANIMATA_CONFIG.minCount}.`);
        }

        return { items, targetCount };
    } catch (error) {
        console.error('[GALERIE ANIMATA] Failed to load or build gallery items:', error.message);
        return { items: [], targetCount: 0 };
    }
}

function compileGalerieAnimataCss(imageCount) {
    if (!imageCount || imageCount < GALERIE_ANIMATA_CONFIG.minCount) {
        return '';
    }

    const scssContent = `
@use "galerie-animata" with (
  $galerie-animata-count: ${imageCount},
  $galerie-animata-duration: ${GALERIE_ANIMATA_CONFIG.perImageSeconds}s,
  $galerie-animata-border-image: "${GALERIE_ANIMATA_CONFIG.borderImage}"
);
`;

    try {
        const result = sass.compileString(scssContent, {
            style: 'compressed',
            loadPaths: [obGlobal.folderScss, path.join(__dirname, 'node_modules')],
            quietDeps: true
        });
        return result.css;
    } catch (error) {
        console.error('[GALERIE ANIMATA] Failed to compile CSS:', error.message);
        return '';
    }
}

function getGalerieAnimataRenderData() {
    const { items, targetCount } = buildGalerieAnimataItems();
    const css = compileGalerieAnimataCss(items.length || targetCount);
    return { items, css };
}

// Galeria statica (0.35p)
function initGalerie() {
    const jsonPath = path.join(__dirname, 'resurse', 'documente', 'galerie.json');
    try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const obGalerie = JSON.parse(jsonContent);
        const basePath = obGalerie.cale_galerie.startsWith('/') ? obGalerie.cale_galerie : `/${obGalerie.cale_galerie}`;
        obGalerie.cale_galerie = basePath;
        obGlobal.obGalerie = obGalerie;
    } catch (error) {
        console.error('Error loading gallery JSON:', error);
        obGlobal.obGalerie = { cale_galerie: '/resurse/imagini/galerie', imagini: [] };
    }
}

function getTrailerAssets() {
    const mp4File = path.join(__dirname, 'resurse', 'video', 'trailer_dune3.mp4');
    const webmFile = path.join(__dirname, 'resurse', 'video', 'trailer_dune3.webm');
    const posterFile = path.join(__dirname, 'resurse', 'imagini', 'trailer_dune3', '3_9vCamtuPY-HD-1200w.webp');

    return {
        videoMp4: fs.existsSync(mp4File) ? 'trailer_dune3.mp4' : null,
        videoWebm: fs.existsSync(webmFile) ? 'trailer_dune3.webm' : null,
        videoPoster: fs.existsSync(posterFile)
            ? '/resurse/imagini/trailer_dune3/3_9vCamtuPY-HD-1200w.webp'
            : '/resurse/imagini/MartySupreme_big.png'
    };
}

verificareEroriJson();
initErori();
initGalerie();
compileAllScss();
watchScssFolder();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.set('X-Debug', '1');
    res.locals.ipUtilizator = req.ip;
    next();
});

app.use((req, res, next) => {
    const galerieAnimataData = getGalerieAnimataRenderData();
    res.locals.galerieAnimata = galerieAnimataData.items;
    res.locals.galerieAnimataCss = galerieAnimataData.css;
    res.locals.galerieAnimataSourceCount = galerieAnimataData.items.length;
    res.locals.categorii = categoriiFilme;
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
app.use('/fisiere_uploadate', express.static(path.join(__dirname, 'fisiere_uploadate')));

app.get(['/index', '/index.html', '/index.ejs'], (req, res) => {
    res.redirect('/');
});

app.get(['/', '/index', '/home'], async (req, res) => {
    const { videoMp4, videoWebm, videoPoster } = getTrailerAssets();

    const galerieDate = await filterGaleryByQuarter(new Date(), obGlobal.obGalerie);

    res.render('pagini/index', {
        videoWebm,
        videoMp4,
        videoPoster,
        galerieDate
    });
});

app.get('/program', async (req, res) => {
    const { videoMp4, videoWebm, videoPoster } = getTrailerAssets();
    const galerieAnimataData = getGalerieAnimataRenderData();

    if (!Array.isArray(galerieAnimataData.items) || galerieAnimataData.items.length === 0) {
        const totalImages = obGlobal.obGalerie && Array.isArray(obGlobal.obGalerie.imagini)
            ? obGlobal.obGalerie.imagini.length
            : 0;
        console.warn(`[GALERIE ANIMATA] Program page has no items. Total galerie images: ${totalImages}.`);
    }

    let produse = [];
    try {
        let query = 'SELECT * FROM filme';
        let params = [];
        if (req.query.tip && categoriiFilme.includes(req.query.tip)) {
            query += ' WHERE categorie_mare = $1';
            params.push(req.query.tip);
        }
        const rezultat = await pool.query(query, params);
        produse = rezultat.rows;
    } catch (error) {
        console.error('[DB] Eroare la preluarea produselor pentru pagina program:', error);
    }

    res.render('pagini/program', {
        videoWebm,
        videoMp4,
        videoPoster,
        produse,
        galerieAnimata: galerieAnimataData.items,
        galerieAnimataCss: galerieAnimataData.css
    });
});

app.get('/galerie', async (req, res) => {
    const galerieDate = await filterGaleryByQuarter(new Date(), obGlobal.obGalerie);
    res.render('pagini/galerie', {
        galerieDate
    });
});

app.get('/produs/:id', async (req, res) => {
    try {
        // Validation for SQL Injection: ensure ID is numeric and use parameterized query
        const idNumeric = parseInt(req.params.id, 10);
        if (isNaN(idNumeric)) {
            return afisareEroare(res, 400, 'ID Invalid', 'Identificatorul produsului trebuie să fie numeric.');
        }

        const rezultat = await pool.query('SELECT * FROM filme WHERE id = $1', [idNumeric]);
        if (rezultat.rows.length === 0) {
            return afisareEroare(res, 404, 'Produs Negăsit', 'Nu a fost găsit niciun film cu acest ID.');
        }
        
        res.render('pagini/produs', { produs: rezultat.rows[0] });
    } catch (error) {
        console.error('[DB] Eroare la preluarea produsului:', error);
        afisareEroare(res, 500);
    }
});

app.get('/*splat', (req, res) => {
    const paginaCeruta = req.path.replace(/^\/+/g, '').replace(/\/+$/g, '');

    if (!paginaCeruta) {
        return res.redirect('/');
    }

    if (paginaCeruta.startsWith('resurse/')) {
        return afisareEroare(res, 404);
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