# Ghid Prezentare Etapa 5 — Compilare SCSS, Bootstrap Custom & Efecte CSS

---

## ÎNTREBĂRI FRECVENTE ALE PROFESOAREI (FAQ)

### „Ce este SASS/SCSS și care este diferența față de CSS?"

**SASS** (Syntactically Awesome Style Sheets) este un **preprocesor CSS** — adică un limbaj de programare care extinde CSS-ul simplu. SASS ne permite să scriem stiluri modulare și curate (cu variabile, imbricare, mixin-uri etc.), codul fiind ulterior tradus (compilat) într-un fișier `.css` standard pe care browserele îl înțeleg direct.

**Diferența între SCSS și SASS:**
* **SCSS** (Sassy CSS) folosește extensia `.scss` și are o sintaxă identică cu CSS-ul clasic: folosește acolade `{}` și punct și virgulă `;`. Orice cod CSS valid este și un cod SCSS valid!
* **SASS** (sintaxa veche) folosește extensia `.sass` și renunță la acolade și punct și virgulă, bazându-se doar pe indentare (tab-uri sau spații).

**Cum îi explici profesoarei:**
> „SCSS este un preprocesor. Browserele nu pot citi fișiere `.scss` direct. De aceea, compilăm codul SCSS în cod CSS standard comprimat. Noi am ales sintaxa `.scss` pentru că este compatibilă 100% cu CSS-ul clasic și este mult mai ușor de citit și întreținut.”

---

### „De ce compilăm automat SCSS-ul în backend și cum funcționează backup-ul?"

Compilarea backend la pornire garantează că paginile au tot timpul stilurile la zi, fără să rulăm manual comenzi externe. 
* **Backup automat:** Înainte ca o nouă compilare să suprascrie codul CSS existent, serverul face automat o copie a CSS-ului vechi în folderul `backup/resurse/css/`. Acest lucru previne pierderea de date în caz că noua compilare eșuează din cauza unei erori de sintaxă în SCSS.
* **Watcher automat:** Folosim `fs.watch()` pe folderul de SCSS. Ori de câte ori salvăm un fișier `.scss`, serverul îl recompilesă instantaneu.

**Cum îi explici profesoarei:**
> „Am creat funcția `compileazaScss()` în backend. La startup, citim fișierele din folderul `scss/` și le transformăm în `.css` în folderul static. Dacă există deja un fișier CSS, îi facem o copie în directorul de backup înainte de a scrie cel nou. De asemenea, watcher-ul monitorizează folderul de SCSS și recompilează automat fișierele la fiecare salvare în timp ce rulăm aplicația.”

---

### „De ce watchScssFolder() folosește setTimeout (Debouncing)?"

Sistemul de operare și editoarele de cod (cum ar fi VS Code) salvează fișierele prin mai multe scrieri rapide consecutive pe disc (scrieri intermediare de siguranță). Acest lucru generează multiple evenimente `change` consecutive în `fs.watch()`.
* **Problema:** Fără un tratament special, serverul ar încerca să compileze de 3-4 ori în aceeași milisecundă, blocând procesul sau creând conflicte de scriere.
* **Soluția (Debouncing):** Folosind un `setTimeout()` de 100 milisecunde, grupăm toate aceste modificări rapide și efectuăm o singură compilare unică și sigură.

**Cum îi explici profesoarei:**
> „Editoarele salvează fișierele în mai mulți pași rapizi pe disc, trimițând mai multe notificări de scriere consecutiv. Folosim o întârziere de 100 de milisecunde cu `setTimeout()` ca să dăm timp editorului să termine scrierea. Astfel, facem o singură compilare curată și stabilă în loc de mai multe compilări suprapuse.”

---

### „Cum funcționează mix-blend-mode în efectul Duotone?"

Efectul **Duotone** transformă o imagine normală într-o operă de artă bicoloră (folosind doar două nuanțe controlate: indigo închis pentru umbre și roșu-cărămiziu pentru lumini).
1. **Separarea Contextului (`isolation: isolate`):** Împiedică culorile din imagine să se amestece cu fundalul general al paginii.
2. **Pseudo-elementul `::before` (Culoarea închisă):** Adaugă un strat albastru-indigo închis cu `mix-blend-mode: lighten`. Modul *lighten* înlocuiește culorile mai închise din imagine cu acest indigo (afectând umbrele).
3. **Pseudo-elementul `::after` (Culoarea deschisă):** Adaugă un strat roșu cu `mix-blend-mode: multiply`. Modul *multiply* colorează zonele luminate și conturează detaliile fine.

**Cum îi explici profesoarei:**
> „Efectul Duotone folosește două pseudo-elemente (`::before` și `::after`) plasate peste imagine. Prin proprietățile `mix-blend-mode: lighten` și `multiply`, înlocuim umbrele cu o nuanță indigo și zonele luminate cu una roșie. La hover pe imagine, schimbăm fluid culorile în verde și galben pentru o animație vizuală deosebită.”

---

### „Cum funcționează transformarea scaleY(-1) pentru reflexie?"

Proprietatea `scaleY(-1)` răstoarnă textul pe axa verticală (îl întoarce cu susul în jos), exact ca o reflexie în apă.
1. **Axa de rotație (`transform-origin: top`):** Face ca rotația textului duplicat să aibă loc chiar la baza textului principal, legându-le perfect.
2. **Gradient pe text (`background-clip: text`):** Face ca reflexia să se estompeze treptat către fundal prin aplicarea unui gradient transparent pe textul răsturnat.
3. **Blur & Opacitate:** Efectul discret de blur (`filter: blur(1.3px)`) și opacitatea mică (`opacity: 0.35`) dau realism imaginii de oglindă.

**Cum îi explici profesoarei:**
> „Am creat un duplicat al textului în HTML pe care l-am întors de sus în jos folosind `transform: scaleY(-1)` cu originea în partea de sus. Aplicăm o mască de text cu gradient pentru ca reflexia să dispară treptat în fundal, iar la hover reflexia se lungește discret datorită unei tranziții CSS.”

---

## TASK-URI DETALIATE ETAPA 5

---

### Galeria Statică (Formă de "O" & Contor Roman) — (0.35p)

* **Unde se află în cod:**
  * Sursa datelor: [galerie.json](./resurse/documente/galerie.json)
  * Logica de backend și selectarea primelor 10 imagini: [liniile 433-440](./index.js#L433-L440) și [liniile 443-455](./index.js#L443-L455) în `index.js`
  * Afișarea în pagină și structura EJS: [liniile 162-186](./views/fragmente/galerie.ejs#L162-L186) în `galerie.ejs`
  * Gridul CSS pentru forma de "O": [liniile 12-30](./views/fragmente/galerie.ejs#L12-L30) în `galerie.ejs`
  * Contorul automat cu cifre romane: [liniile 133-140](./views/fragmente/galerie.ejs#L133-L140) în `galerie.ejs`

#### Structura EJS (`galerie.ejs`):
```html
<div class="galerie-grid">
	<% if (galerieDate && galerieDate.length > 0) { %>
		<% galerieDate.forEach((imagine, idx) => { %>
			<figure class="galerie-item<%= idx === 0 ? ' dune-duotone' : '' %>">
				<div class="galerie-media">
					<img 
						src="<%= (imagine.cale_galerie || '/resurse/imagini') + '/' + imagine.cale_imagine %>" 
						alt="<%= imagine.alt || imagine.cale_imagine %>"
						title="<%= imagine.descriere %>"
					>
				</div>
				<figcaption>
					<%= imagine.titlu %>
				</figcaption>
			</figure>
		<% }); %>
	<% } %>
</div>
```

#### Stilul CSS pentru Așezarea în Formă de "O" (`galerie.ejs`):
```css
@media (min-width: 1024px) {
	.galerie-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	/* Distribuim elementele pe margini, lăsând mijlocul gol */
	.galerie-item:nth-child(1) { grid-column: 1; grid-row: 1; }
	.galerie-item:nth-child(2) { grid-column: 2; grid-row: 1; }
	.galerie-item:nth-child(3) { grid-column: 3; grid-row: 1; }
	.galerie-item:nth-child(4) { grid-column: 1; grid-row: 2; }
	.galerie-item:nth-child(5) { grid-column: 3; grid-row: 2; } /* Mijlocul pe randul 2 ramane liber */
	.galerie-item:nth-child(6) { grid-column: 1; grid-row: 3; }
	.galerie-item:nth-child(7) { grid-column: 3; grid-row: 3; } /* Mijlocul pe randul 3 ramane liber */
	.galerie-item:nth-child(8) { grid-column: 1; grid-row: 4; }
	.galerie-item:nth-child(9) { grid-column: 2; grid-row: 4; }
	.galerie-item:nth-child(10) { grid-column: 3; grid-row: 4; }
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Serverul încarcă imaginile din `galerie.json` la pornire și folosește o funcție care decupează primele 10 elemente pentru a se potrivi perfect pe layout-ul de 3x4 (cu mijlocul gol).
* În CSS Grid, pe ecrane mari (peste `1024px`), așezăm imaginile în formă de litera **O** folosind proprietățile `grid-column` și `grid-row` pentru a lăsa libere pozițiile din mijloc (coloana 2, rândurile 2 și 3).
* Contorul CSS `galerie-counter` generează automat un prefix cu cifre romane (ex: **I.**, **II.**, **III.**) în fața fiecărui titlu de imagine în mod nativ, direct din CSS!

---

### Compilarea Automată a SCSS-urilor — (0.25p)

* **Unde se află în cod:**
  * Definirea directoarelor de resurse: [liniile 8-13](./index.js#L8-L13) în `index.js`
  * Generarea automată a folderelor (inclusiv backup): [liniile 15-22](./index.js#L15-L22) în `index.js`
  * Funcția principală de compilare și backup: [liniile 37-81](./index.js#L37-L81) în `index.js`
  * Watcher-ul de directoare cu debouncing: [liniile 103-115](./index.js#L103-L115) în `index.js`
  * Apelurile la inițializarea serverului: [liniile 474-475](./index.js#L474-L475) în `index.js`

#### Logica de Compilare și Backup (`index.js`):
```javascript
function compileazaScss(caleScss, caleCss) {
    const pathScss = path.isAbsolute(caleScss) ? caleScss : path.join(obGlobal.folderScss, caleScss);
    let pathCss = caleCss ? (path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss)) : null;
    
    if (!pathCss) {
        const nameNoExt = path.parse(caleScss).name;
        pathCss = path.join(obGlobal.folderCss, `${nameNoExt}.css`);
    }
    
    // Backup automat daca fisierul vechi exista deja
    if (fs.existsSync(pathCss)) {
        const backupDir = path.join(__dirname, 'backup', 'resurse', 'css');
        const backupPath = path.join(backupDir, path.basename(pathCss));
        fs.mkdirSync(backupDir, { recursive: true });
        fs.copyFileSync(pathCss, backupPath); // Copie in backup
    }
    
    // Compilare cu pachetul sass
    const result = sass.compile(pathScss, { style: 'compressed' });
    fs.writeFileSync(pathCss, result.css);
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Căile absolute către folderele de SCSS și CSS sunt salvate în obiectul global `obGlobal`.
* La pornire, serverul creează automat directoarele lipsă (cum ar fi `backup/resurse/css/`).
* Funcția `compileazaScss` preia un fișier SCSS. Dacă există deja o versiune CSS veche a acestuia pe disc, serverul îi face rapid o copie de siguranță în folderul de backup, apoi apelează compilatorul `sass` în mod comprimat și scrie noul fișier CSS generat.
* Watcher-ul `watchScssFolder` monitorizează folderul de SCSS. Când modificăm un fișier și salvăm, compilatorul reface stilurile instantaneu (folosind o mică amânare de 100ms ca să nu blokeze sistemul).

---

### Customizarea Bootstrap din SCSS — (0.25p)

* **Unde se află în cod:**
  * Variabilele de culoare, fonturi, breakpoints, margini și importul Bootstrap: [liniile 17-46](./scss/custom.scss#L17-L46), [liniile 52-82](./scss/custom.scss#L52-L82), [liniile 88-95](./scss/custom.scss#L88-L95), [liniile 113-116](./scss/custom.scss#L113-L116) și [liniile 181-244](./scss/custom.scss#L181-L244) în `custom.scss`
  * Ordinea corectă de import a CSS-urilor în pagină: [liniile 18-19](./views/fragmente/head.ejs#L18-L19) și [liniile 21-22](./views/fragmente/head.ejs#L21-L22) în `head.ejs`

#### Modificarea Variabilelor Bootstrap (`custom.scss`):
```scss
// Definim culorile marcii Cinemania
$primary: #A6192E;        // Rosu
$secondary: #E5B143;      // Auriu
$dark: #121212;           // Background inchis premium
$light: #f5f4f1;          // Fundal text deschis

// Aliniem fonturile la design-ul general
$font-family-base: 'Montserrat', sans-serif;
$headings-font-family: 'Oswald', sans-serif;

// Personalizam dimensiunile de ecrane mari
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 1024px,             // Implicit in Bootstrap este 992px, am setat 1024px!
  xl: 1280px,
  xxl: 1400px
);

$border-radius: 8px;      // Colturi rotunjite customizate

// Importam Bootstrap impreuna cu configuratiile noastre custom
@use "bootstrap/scss/bootstrap" as bootstrap with (
    $primary: $primary,
    $secondary: $secondary,
    $dark: $dark,
    $light: $light,
    $font-family-base: $font-family-base,
    $headings-font-family: $headings-font-family,
    $grid-breakpoints: $grid-breakpoints,
    $border-radius: $border-radius
);
```

**Ce face acest cod pe înțelesul tuturor:**
* În loc să folosim varianta standard Bootstrap, noi îi modificăm nucleul direct în faza de compilare SCSS.
* Suprascriem paleta de culori primare și secundare cu culorile brandului nostru (roșu și auriu).
* Modificăm fonturile (Montserrat pentru text simplu și Oswald pentru titluri) și setăm colțurile elementelor la o rază de 8px.
* Modificăm breakpoint-ul `lg` (ecrane mari) la `1024px` în loc de `992px` standard.
* **Ordinea din Head:** În `head.ejs`, legăm fișierul `custom.css` (Bootstrap compilat) *deasupra* fișierului nostru `general.css`. Datorită regulilor de prioritate (Cascading), acest lucru ne garantează că stilurile noastre originale din `general.css` nu vor fi stricate de Bootstrap!

---

### Efectul CSS: Duotone — (0.05p)

* **Unde se află în cod:**
  * Stilurile și efectele de blend-mode: [liniile 90-120](./views/fragmente/galerie.ejs#L90-L120) în `galerie.ejs`

#### Definirea stilului Duotone (`galerie.ejs`):
```css
.dune-duotone .galerie-media {
	isolation: isolate; /* Asigura un context izolat pentru mixarea culorilor */
}

.dune-duotone .galerie-media::before,
.dune-duotone .galerie-media::after {
	content: ""; position: absolute; inset: 0; pointer-events: none;
	transition: background-color 0.55s ease;
}

/* Stratul 1: Nuanta inchisa aplicata pe umbre */
.dune-duotone .galerie-media::before {
	background-color: #0f2d4d; /* Albastru-indigo */
	mix-blend-mode: lighten;
}

/* Stratul 2: Nuanta deschisa aplicata pe zonele luminate */
.dune-duotone .galerie-media::after {
	background-color: #c93b3b; /* Rosu-caramiziu */
	mix-blend-mode: multiply;
}

/* Animatie fluidă la trecerea mouse-ului */
.dune-duotone:hover .galerie-media::before { background-color: #244f24; } /* Verde-inchis */
.dune-duotone:hover .galerie-media::after  { background-color: #f0bf45; } /* Galben-auriu */
```

**Ce face acest cod pe înțelesul tuturor:**
* Prima imagine din galerie primește automat clasa `.dune-duotone`.
* Folosim pseudo-elementele CSS `::before` și `::after` pentru a plasa două straturi colorate peste imagine.
* Modul `lighten` aplicat pe stratul indigo deschide umbrele imaginii, în timp ce modul `multiply` aplicat pe stratul roșu colorează zonele albe ale imaginii.
* Când utilizatorul pune mouse-ul peste imagine, culorile trec lin (cu o tranziție de 0.55 secunde) într-o combinație forestieră superbă de verde și galben.

---

### Efectul CSS: Reflexie pe Text — (0.15p)

* **Unde se află în cod:**
  * Stilurile CSS pentru reflexie și hover: [liniile 640-670](./resurse/stiluri/general.css#L640-L670) în `general.css`
  * Textul duplicat în HTML (pentru accesibilitate): [liniile 14-17](./views/pagini/index.ejs#L14-L17) în `index.ejs`

#### Structura HTML din index (`index.ejs`):
```html
<h2 class="reflect-title" aria-label="Acum in cinema">
	<span class="reflect-main">Acum in cinema</span>
	<span class="reflect-copy" aria-hidden="true">Acum in cinema</span>
</h2>
```

#### Stilul CSS pentru Răsturnare și Gradient (`general.css`):
```css
.reflect-title {
    display: inline-flex;
    flex-direction: column;
    line-height: 1;
}

.reflect-copy {
    display: block;
    transform: scaleY(-1) translateY(-0.05em); /* Intoarcere pe verticala */
    transform-origin: top;                     /* Originea rotatiei este fixata sus */
    opacity: 0.35;                             /* Aspect sters */
    filter: blur(1.3px);                       /* Oglindire usor blurata */
    background: linear-gradient(to bottom, rgba(245, 245, 245, 0.3), rgba(245, 245, 245, 0));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;                        /* Aplicam gradientul exclusiv pe forma literelor */
    transition: transform 0.45s ease, opacity 0.45s ease;
}

/* Efect dinamic cand trecem cu mouse-ul */
.reflect-title:hover .reflect-copy {
    transform: scaleY(-1.45) translateY(-0.12em); /* Reflexia se intinde lung */
    opacity: 0.5;
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Pentru a proteja cititoarele de ecran destinate persoanelor cu deficiențe de vedere, duplicăm textul în HTML dar îi atașăm atributul `aria-hidden="true"`, oferind în același timp un label curat pe elementul părinte (`aria-label`).
* În CSS, textul secundar (`.reflect-copy`) este întors complet la 180 de grade în jos (`scaleY(-1)`).
* Folosind `-webkit-background-clip: text`, aplicăm un gradient de transparență care pornește de la 30% opacitate și devine complet invizibil spre capăt.
* La hover pe titlu, reflexia se lungește și devine ușor mai vizibilă prin animații CSS dinamice și elegante.

---

### Scrierea Textului pe 2 Coloane — (0.025p)

* **Unde se află în cod:**
  * Definirea coloanelor în CSS: [liniile 797-804](./resurse/stiluri/general.css#L797-L804) în `general.css`
  * Trecerea la o singură coloană pe mobil: [liniile 1101-1105](./resurse/stiluri/general.css#L1101-L1105) în `general.css`
  * Aplicarea clasei în HTML: [linie 143](./views/pagini/bilete.ejs#L143) în `bilete.ejs`

#### Stilul CSS (`general.css`):
```css
.promo-columns-text {
    margin: 14px 0 0 0;
    color: rgba(245, 245, 245, 0.9);
    line-height: 1.6;
    column-count: 2; /* Imparte paragraful in doua coloane egale */
    column-gap: 1.6rem; /* Spatiu generos intre coloane */
    column-rule: 1px solid rgba(229, 177, 67, 0.35); /* Linie aurie fina despartitoare */
}

@media (max-width: 1023px) {
    .promo-columns-text {
        column-count: 1; /* Pe tablete si telefoane textul redevine continuu */
        column-rule: none;
    }
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Paragraful informativ despre campaniile Cinemania este împărțit automat pe 2 coloane egale.
* Stilul definește o linie fină, transparentă, aurie ca separator vertical între coloane (`column-rule`) și o distanță confortabilă pentru lectură (`column-gap`).
* Pe ecrane mai mici de `1024px`, o regulă media query anulează cele două coloane (`column-count: 1`), făcând textul să curgă normal pe un singur rând pentru a asigura o citire ușoară pe ecrane de telefon sau tabletă.

---

### Personalizarea Textului Selectat (::selection) — (0.025p)

* **Unde se află în cod:**
  * Stilurile CSS globale: [liniile 1129-1137](./resurse/stiluri/general.css#L1129-L1137) în `general.css`

#### Regula CSS Selection (`general.css`):
```css
::selection {
    background: var(--clr-gold);    /* Fundal auriu premium */
    color: var(--clr-pure-black);   /* Text negru mat */
}

::-moz-selection {
    background: var(--clr-gold);    /* Compatibilitate speciala cu Firefox */
    color: var(--clr-pure-black);
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Schimbă modul de afișare implicit al textului atunci când utilizatorul îl selectează cu mouse-ul pe pagină.
* Elimină fundalul albastru standard oferit de sistemele de operare și îl înlocuiește cu un auriu premium combinat cu text negru mat, o potrivire perfectă cu brandul Cinemania.

---

### Text care se plimbă orizontal (Marquee cu Keyframes) — (0.05p)

* **Unde se află în cod:**
  * Animația CSS și vitezele de derulare: [liniile 1069-1099](./resurse/stiluri/general.css#L1069-L1099) în `general.css`
  * Ajustarea vitezei pentru ecrane medii: [liniile 1107-1114](./resurse/stiluri/general.css#L1107-L1114) în `general.css`
  * Regula de accesibilitate pentru mișcare redusă: [liniile 1116-1126](./resurse/stiluri/general.css#L1116-L1126) în `general.css`
  * Structura HTML în index: [liniile 87-91](./views/pagini/index.ejs#L87-L91) în `index.ejs`

#### Stilul CSS pentru Derulare Continua (`general.css`):
```css
.anunt-recurent {
    width: 100%; max-width: 100%; overflow: hidden; /* Important: taie textul care iese din ecran */
    border: 1px solid rgba(229, 177, 67, 0.45); border-radius: 999px;
}

.anunt-recurent-track span {
    display: inline-block;
    animation: anunt-recurent-slide 17s linear infinite; /* Animație liniară continuă */
    will-change: transform; /* Spune browserului sa foloseasca accelerarea hardware */
}

@keyframes anunt-recurent-slide {
    from { transform: translateX(100%); }  /* Porneste din extrema dreapta a ecranului */
    to { transform: translateX(-100%); }   /* Se termina in extrema stanga a ecranului */
}

/* Accesibilitate: Oprim complet miscarea daca utilizatorul are setat "Reduced Motion" */
@media (prefers-reduced-motion: reduce) {
    .anunt-recurent-track { white-space: normal; }
    .anunt-recurent-track span {
        display: block; animation: none;
    }
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Am creat o bară orizontală pentru anunțuri în pagina principală (anunțând programul extins sau promoțiile active).
* Containerul are proprietatea `overflow: hidden` pentru ca textul care iese în afara limitelor sale să fie complet ascuns, eliminând riscul apariției unui scrollbar orizontal în browser.
* Textul din interior se mișcă continuu de la dreapta la stânga folosind `@keyframes` și proprietatea `translateX`.
* **Regulă critică de accesibilitate:** Pentru persoanele sensibile la mișcare (care au bifat opțiunea de reducere a animațiilor din Windows/macOS/Linux), animația este oprită complet (`animation: none`), iar textul este afișat static, asigurând conformitatea cu standardele moderne de accesibilitate (WCAG).

---

### Separator Stilizat (hr peliculă de film) — (0.1p)

* **Unde se află în cod:**
  * Stilurile CSS ale separatorului: [liniile 807-826](./resurse/stiluri/general.css#L807-L826) în `general.css`
  * Aplicarea liniei în HTML: [linie 115](./views/pagini/index.ejs#L115) în `index.ejs`

#### Stilul CSS (`general.css`):
```css
.cinema-hr {
    height: 10px; border: 0; margin: 0 0 20px;
    background: linear-gradient(
        135deg,
        transparent 0%, transparent 7%,
        var(--clr-gold) 7%, var(--clr-gold) 46%,
        transparent 46%, transparent 54%,
        var(--clr-base-red) 54%, var(--clr-base-red) 93%,
        transparent 93%, transparent 100%
    );
    border-radius: 999px;
    /* Umbrele dau un efect elegant, 3D */
    box-shadow: 0 0 0 1px rgba(245, 245, 245, 0.08), 0 5px 14px rgba(0, 0, 0, 0.28);
}
```

**Ce face acest cod pe înțelesul tuturor:**
* Separatorul standard `<hr>` este transformat dintr-o simplă linie ștearsă gri într-o bară tridimensională de design de 10px grosime, cu colțuri fin rotunjite.
* Folosind un gradient liniar în diagonală la `135deg` cu opriri de culoare succesive, creăm un model repetitiv de linii înclinate în nuanțe de roșu și auriu, simulând perforațiile sau dungile unei pelicule clasice de film cinematografic.
* Umbra adăugată (`box-shadow`) conferă adâncime și scoate în relief elementul, integrându-l perfect în designul premium al site-ului Cinemania.

---

## Bonus: Galerie Animată

### Identificator: `galerie-animata`

### Descrierea cerințelor

Galeria animată afișează un număr **impar aleator** de imagini, cuprins între **5** și **11** (inclusiv), preluat din JSON-ul galeriei statice (`resurse/documente/galerie.json`). Imaginile alese sunt **ultimele definite** în JSON și trebuie să fie **distincte** (fără duplicate).

La **fiecare încărcare** a paginii se generează un nou număr aleator de imagini.

### Cum funcționează

#### 1. Generarea numărului aleator de imagini (`index.js`)

Funcția `getRandomOdd(min, max)` generează un număr impar aleator între `GALERIE_ANIMATA_CONFIG.minCount` (5) și `GALERIE_ANIMATA_CONFIG.maxCount` (11):

```javascript
function getRandomOdd(min, max) {
    const minOdd = min % 2 === 0 ? min + 1 : min;
    const maxOdd = max % 2 === 0 ? max - 1 : max;
    if (minOdd > maxOdd) return min;
    const countOdds = Math.floor((maxOdd - minOdd) / 2) + 1;
    return minOdd + 2 * Math.floor(Math.random() * countOdds);
}
```

#### 2. Selectarea imaginilor (`buildGalerieAnimataItems()`)

Funcția parcurge array-ul `imagini` din JSON **de la sfârșit spre început**, colectând imagini distincte (fără `cale_imagine` duplicat) până la `targetCount`. Dacă numărul rezultat este par, se elimină ultima imagine.

#### 3. Compilarea dinamică a CSS-ului SCSS (`compileGalerieAnimataCss()`)

CSS-ul galeriei este generat dinamic prin **Node.js** la fiecare request, folosind `sass.compileString()`. Numărul de imagini este pasat ca variabilă SCSS `$galerie-animata-count`, iar durata per imagine ca `$galerie-animata-duration`:

```javascript
const scssContent = `
@use "galerie-animata" with (
  $galerie-animata-count: ${imageCount},
  $galerie-animata-duration: ${GALERIE_ANIMATA_CONFIG.perImageSeconds}s,
  $galerie-animata-border-image: "${GALERIE_ANIMATA_CONFIG.borderImage}"
);
`;
const result = sass.compileString(scssContent, { ... });
```

Astfel, animația CSS se adaptează automat la câte imagini sunt pe pagină.

#### 4. Fișierul SCSS (`scss/galerie-animata.scss`)

**Border-image:** Galeria folosește un `border-image` cu imaginea SVG `cinematografe-harta.svg`.

**Animația `galerie-animata-cycle`:**

Procentajele keyframe sunt **calculate dinamic** din `$per = 100 / $galerie-animata-count`, astfel încât fiecare imagine deține exact `1/N` din ciclul total al animației (ex: 7 imagini → ~14.3%, 9 imagini → ~11.1%).

Tranziția propriu-zisă folosește o schimbare de `z-index` pentru a garanta că imaginea curentă rămâne deasupra doar cât timp e activă, și trece dedesubt (așteptând următoarea tură) pentru a dezvălui imaginea următoare.

**Fazele pentru imaginea activă (`0% → $per`) — cu `z-index: 10`:**
* **`0%` → `$per * 0.15`**: Pauza inițială, imaginea e complet vizibilă.
* **`$per * 0.15` → `$per * 0.65`**: Cercul **se micșorează** (de la 75% la 25%) **FĂRĂ efect de spin**.
* **`$per * 0.65` → `$per * 0.85`**: Când cercul e mic, **SE BAGĂ efectul de spin** (0° → 90°) și începe să scadă opacitatea.
* **`$per * 0.85` → `$per`**: Cercul se închide la 0, spinul ajunge la 180°, opacitatea e 0.

**Fazele de ascundere și așteptare:**
* **`$per` → `100 - $per`**: Imaginea e complet invizibilă (`opacity: 0`, `z-index: 0`).
* **`100 - $per` → `100%`**: Imaginea redevine vizibilă dar trece **dedesubtul tuturor** (`z-index: 1`) pentru a fi pregătită ca fundal când imaginea activă de deasupra se va decupa.

Durata per imagine este mărită la **3.5 secunde** (`perImageSeconds: 3.5` în `GALERIE_ANIMATA_CONFIG`) pentru un efect lent și pronunțat.

```scss
$per: 100 / $galerie-animata-count;

@keyframes galerie-animata-cycle {
  0%                              { z-index: 10; opacity: 1;   clip-path: circle(75% at 50% 50%); transform: rotate(0deg); }
  #{percentage($per * 0.15 / 100)}  { z-index: 10; opacity: 1;   clip-path: circle(75% at 50% 50%); transform: rotate(0deg); }
  #{percentage($per * 0.65 / 100)}  { z-index: 10; opacity: 1;   clip-path: circle(25% at 50% 50%); transform: rotate(0deg); }
  #{percentage($per * 0.85 / 100)}  { z-index: 10; opacity: 0.3; clip-path: circle(5% at 50% 50%);  transform: rotate(90deg); }
  #{percentage($per / 100)}         { z-index: 10; opacity: 0;   clip-path: circle(0% at 50% 50%);  transform: rotate(180deg); }
  #{percentage(($per + 0.001) / 100)} { z-index: 0; opacity: 0;   clip-path: circle(0% at 50% 50%);  transform: rotate(0deg); }
  #{percentage((100 - $per) / 100)} { z-index: 0; opacity: 0;   clip-path: circle(0% at 50% 50%);  transform: rotate(0deg); }
  #{percentage((100 - $per + 0.001) / 100)} { z-index: 1; opacity: 1;   clip-path: circle(75% at 50% 50%); transform: rotate(0deg); }
  100%                            { z-index: 1; opacity: 1;   clip-path: circle(75% at 50% 50%); transform: rotate(0deg); }
}
```

**Pauza la hover:** Când cursorul este pe galerie, animația se oprește (`animation-play-state: paused`).

**Vizibilitate responsivă:** Galeria are `display: none` implicit și devine `display: block` doar pe ecran mare (`min-width: 1024px`). Nu se afișează pe ecran mediu și mic.

#### 5. Integrarea în pagina Program (`views/pagini/program.ejs`)

CSS-ul compilat este injectat direct în pagină ca `<style>` inline, iar imaginile sunt generate server-side și randate ca elemente `<figure>` cu tag-ul `<!-- Galerie animata -->`:

```html
<!-- Galerie animata -->
<% if (typeof galerieAnimataCss !== 'undefined' && galerieAnimataCss) { %>
    <style><%- galerieAnimataCss %></style>
<% } %>
<div class="galerie-animata" aria-label="Galerie animata filme">
    <% galerieAnimata.forEach((imagine) => { %>
        <figure class="galerie-animata__item">
            <img class="galerie-animata__img" src="..." alt="..." title="...">
        </figure>
    <% }); %>
</div>
<!-- End Galerie animata -->
```

### Fișierele implicate

| Fișier | Rol |
|---|---|
| `index.js` | Generare număr aleator, selectare imagini, compilare SCSS dinamic |
| `scss/galerie-animata.scss` | Stiluri SCSS cu animație clip-path cerc + rotație |
| `views/pagini/program.ejs` | Template-ul paginii Program cu galeria animată |
| `resurse/documente/galerie.json` | Sursa de imagini (JSON-ul galeriei statice) |
| `resurse/imagini/cinematografe-harta.svg` | Imaginea folosită pentru `border-image` |
