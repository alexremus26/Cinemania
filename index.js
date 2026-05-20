const express = require('express');
const fs = require('fs');
const path = require('path');
const sass = require('sass');

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
            const cssFileName = path.basename(pathCss);
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

function getQuarterHour(date) {
    const minutes = date.getMinutes();
    return Math.floor(minutes / 15) + 1;
}

function filterGaleryByQuarter(date, obGalerie) {
    // Display first 10 images to match 3x4 desktop O-shape layout
    return obGalerie.imagini.slice(0, 10).map((imagine) => ({
        ...imagine,
        cale_galerie: obGalerie.cale_galerie,
        alt: imagine.alt || imagine.cale_imagine
    }));
}

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

initErori();
initGalerie();
compileAllScss();
watchScssFolder();

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
app.use('/fisiere_uploadate', express.static(path.join(__dirname, 'fisiere_uploadate')));

app.get(['/index', '/index.html', '/index.ejs'], (req, res) => {
    res.redirect('/');
});

app.get(['/', '/index', '/home'], (req, res) => {
    const { videoMp4, videoWebm, videoPoster } = getTrailerAssets();

    const galerieDate = filterGaleryByQuarter(new Date(), obGlobal.obGalerie);

    res.render('pagini/index', {
        videoWebm,
        videoMp4,
        videoPoster,
        galerieDate
    });
});

app.get('/program', (req, res) => {
    const { videoMp4, videoWebm, videoPoster } = getTrailerAssets();

    res.render('pagini/program', {
        videoWebm,
        videoMp4,
        videoPoster
    });
});

app.get('/galerie', (req, res) => {
    const galerieDate = filterGaleryByQuarter(new Date(), obGlobal.obGalerie);
    res.render('pagini/galerie', {
        galerieDate
    });
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