# Bonus Features Implementation Guide

## 📋 Structura Bonusurilor

### **BONUS 1 - CSS Reset și MathML Styling (0.10-0.25)**

#### 1️⃣ CSS Reset (0.05-0.15 puncte)
**Status:** ✅ DONE
**Fișier:** `/css/reset.css`

**Descriere:**
- Resetare CSS completă cu redefinirea:
  - Spacing-ului (margin, padding)
  - Dimensiunilor și culorilor default
  - Stiluri **bold** și *italic*
  - Bullet-uri și indici de listă
  - Stiluri tabele
  
- **Constrângeri implementate:**
  - HTML și body → dimensiuni în unități **fixe** (px, vh, vw)
  - Toate celelalte elemente → unități **relative** (em, rem, %)
  - Variabile CSS cu prefixul `--reset-` pentru valori repetate

**Locație:** [css/reset.css](css/reset.css) - 98 linii

**Elementele resetate:**
- HTML & body: margin 0, padding 0, width 100%, height auto
- All elements: margin 0, padding 0, border 0, font-size inherit
- Lists (ol, ul, li): list-style none
- Tables: border-collapse, border-spacing 0
- Buttons/Inputs: font inherit, margin 0, padding 0, border 0
- Form elements: background transparent, color inherit
- Links, Images: margin 0, padding 0, display block (images)
- Bold/Italic: proper font-weight și font-style
- Subscript/Superscript: corect positioned

**Commit message:** `feat(bonus1-reset): Implement CSS Reset with fixed units for html/body and relative units for other elements`

#### 2️⃣ MathML Styling (0.05-0.1 puncte)
**Status:** ✅ DONE
**Fișier HTML:** `/index.html` - secțiunea "Calculator Preț Bilet" (liniile ~214-240)
**Fișier CSS:** `/css/general.css` (liniile ~582-635)

**Structură HTML MathML:**
```html
<section id="locatii">
    <h2>Calculator Preț Bilet</h2>
    <div class="formula-box">
        <p><strong>Formula Preț Bilet:</strong></p>
        <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
            <mrow>
                <msub>
                    <mi>P</mi>
                    <mi>final</mi>
                </msub>
                <mo>=</mo>
                <msub>
                    <mi>P</mi>
                    <mi>base</mi>
                </msub>
                <mo>×</mo>
                <mrow>
                    <mo>(</mo>
                    <mn>1</mn>
                    <mo>−</mo>
                    <mi>r</mi>
                    <mo>)</mo>
                </mrow>
                <mo>+</mo>
                <mi>taxa</mi>
            </mrow>
        </math>
```

**CSS Styling Aplicat (în `/css/general.css`):**

| Element MathML | Proprietate CSS | Valoare | Detailii |
|---|---|---|---|
| `math` | display | block | Pe toată linia |
| `math mrow` | display | flex | Layout orizontal |
| | justify-content | center | Centrat |
| | align-items | center | Aliniat vertical |
| | gap | 0.3em | Spațiere între elemente |
| `math mi` | color | #E5B143 (aur) | Variabile: P, r, taxa |
| | font-weight | 600 | Bold |
| | font-style | italic | Italic |
| `math mn` | color | #FF6B6B (roșu) | Numere: 1, 0 |
| | font-weight | bold | Bold |
| `math mo` | color | #F5F5F5 (alb) | Operatori: =, ×, −, + |
| | margin | 0 0.15em | Spațiat |
| `math msub > mi:last-child` | color | #A3D5FF (light blue) | Subscripți: final, base |
| | font-size | 0.7em | Mai mic |
| Hover effect | text-shadow | glow 8px | Effect pe minut și mn |

**Rezultat Visual:**
- **P**, **r**, **taxa** = culoare **aur** + *italic* + **bold**
- **final**, **base** (subscripți) = culoare **light blue** + font **mai mic**
- **1**, **0** (numere) = culoare **roșu** + **bold**
- **=**, **×**, **−**, **(**, **)**, **+** (operatori) = culoare **albă** + spațiată
- **Hover effect:** glow auriu pe variabile, glow roșu pe numere

**Commit message:** `feat(bonus1-mathml): Style MathML formula with different colors, weights, and hover effects`

---

### **BONUS 2 - Hamburger Menu cu Animații (0.15) - COMPLET ✅**

#### 3️⃣ Hamburger Icon din HTML/CSS (0.05 puncte)
**Status:** ✅ DONE
**Fișier HTML:** `/index.html` - secțiunea nav (liniile 37-42)
**Fișier SCSS:** `/scss/_responsive-nav.scss` (liniile 33-50)

**HTML Structure (deja existent):**
```html
<label for="menu-toggle" class="burger-btn" aria-label="Meniu">
    <span></span>
    <span></span>
    <span></span>
</label>
```

**CSS Styling (în SCSS):**
```scss
.burger-btn {
  @include flex-center;  /* Flexbox centered */
  flex-direction: column;
  gap: 5px;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--clr-base-red);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;

  span {
    display: block;
    width: 22px; /* Dreptunghi */
    height: 2px; /* Dreptunghi */
    background: var(--clr-white);
    animation: barAppear 0.6s ease-out forwards;
    position: relative; /* Pentru transformări */
  }
}
```

**Commit message:** `feat(bonus2-hamburger): Create hamburger menu icon from 3 spans with absolute positioning and animations`

---

#### 4️⃣ Animația Apariției Hamburger (0.05 puncte)
**Status:** ✅ DONE
**Fișier:** `/scss/_responsive-nav.scss` (liniile 192-213)

**@keyframes barAppear (3 cadre cheie):**
```scss
@keyframes barAppear {
  0% {
    opacity: 0;                          /* Transparent */
    transform: scaleY(0) scaleX(0.5);   /* Transformare geometrică */
    background: var(--clr-base-red);    /* Culoare */
  }

  50% {
    opacity: 0.8;                       /* Opacity intermediar */
    transform: scaleY(1.1) scaleX(0.9); /* Transformare - overscale */
    background: var(--clr-gold);        /* Culoare intermediară */
  }

  100% {
    opacity: 1;                         /* Opac complet */
    transform: scaleY(1) scaleX(1);     /* Transformare - normal */
    background: var(--clr-white);       /* Culoare finală */
  }
}
```

**Proprietăți modificate:**
- ✅ **Opacitate:** 0 → 0.8 → 1
- ✅ **Transformare geometrică:** scaleY/scaleX (3 stadii)
- ✅ **Culoare:** roșu (#A6192E) → aur (#E5B143) → alb (#F5F5F5)
- ⬅️ Bonus: scaleY(1.1) în 50% pentru efect de "bounce"

**Durata:** 0.6s, easing: ease-out

**Commit message:** `feat(bonus2-animation): Add hamburger appearance animation with 3+ keyframes (opacity, transform, color)`

---

#### 5️⃣ Animații Successive cu Delay (0.05 puncte)
**Status:** ✅ DONE
**Fișier:** `/scss/_responsive-nav.scss` (liniile 46-50)

**SCSS @for Loop:**
```scss
@for $i from 1 through 3 {
  span:nth-child(#{$i}) {
    animation-delay: ($i - 1) * 0.3s;
  }
}
```

**Rezultat (datorită @for loop):**
| Bar | Selector | Delay | Start Time |
|-----|----------|-------|------------|
| Bar 1 | span:nth-child(1) | 0ms | 0ms |
| Bar 2 | span:nth-child(2) | 300ms | 300ms |
| Bar 3 | span:nth-child(3) | 600ms | 600ms |

**Effect Visual:**
- Barele apar succesiv cu o diferență de **300 millisecunde**
- Fiecare bară are propria animație `barAppear` cu durata 0.6s
- Timeline: Bara 1 (0-600ms) → Bara 2 (300-900ms) → Bara 3 (600-1200ms)

**Commit message:** `feat(bonus2-successive): Add individual animations to hamburger bars with 300ms staggered delays using SCSS @for loop`

---

## 🎯 Rezumat de Implementare

## ✅ Rezumat de Implementare - FINALIZAT

### Bonus 1 - CSS Reset (0.05-0.15) ✅
1. **CSS Reset** - [css/reset.css](css/reset.css) - DONE
2. **MathML Styling** - [css/general.css](css/general.css) + [index.html](index.html) - DONE

### Bonus 2 - Hamburger Menu (0.15) ✅
3. **Hamburger Icon** - [scss/_responsive-nav.scss](scss/_responsive-nav.scss) (liniile 33-50) - DONE
4. **Hamburger Animation** - [scss/_responsive-nav.scss](scss/_responsive-nav.scss) (liniile 192-213) - DONE
5. **Successive Animations** - [scss/_responsive-nav.scss](scss/_responsive-nav.scss) (liniile 46-50) - DONE

---

## 📊 Structura Commit-urilor Recomandate - READY

### **Commit 1: CSS Reset** ✅
```bash
git add css/reset.css
git commit -m "feat(bonus1-reset): Implement CSS Reset with fixed units for html/body and relative units for other elements"
```

### **Commit 2: MathML Styling** ✅
```bash
git add index.html css/general.css
git commit -m "feat(bonus1-mathml): Style MathML formula with different colors, weights, and hover effects"
```

### **Commit 3: Hamburger Icon + Animations** ✅
```bash
git add scss/_responsive-nav.scss
git commit -m "feat(bonus2-complete): Add hamburger menu with appearance animation and successive bar delays (300ms staggered using SCSS @for)"
```

**OU (separare per cerință):**

### **Commit 3: Hamburger Icon** ✅
```bash
git add scss/_responsive-nav.scss
git commit -m "feat(bonus2-hamburger): Create hamburger menu icon from 3 spans with animation support"
```

### **Commit 4: Hamburger Appearance Animation** ✅
```bash
git add scss/_responsive-nav.scss
git commit -m "feat(bonus2-animation): Add hamburger appearance animation with 3+ keyframes (opacity, transform, color)"
```

### **Commit 5: Successive Bar Animations** ✅ (already included)
```bash
git add scss/_responsive-nav.scss
git commit -m "feat(bonus2-successive): Add individual bar animations with 300ms staggered delays using SCSS @for loop"
```

---

## 📝 Checklist pentru Prezentare

### Bonus 1 - CSS Reset
- [ ] Fișier separat `/css/reset.css`
- [ ] HTML/body cu unități fixe (px)
- [ ] Alte elemente cu unități relative (em, rem, %)
- [ ] Variabile CSS pentru valori repetate
- [ ] Resetare: spacing, dimensiuni, culori, bold/italic, liste, tabele

### Bonus 1 - MathML Styling
- [x] Formulă MathML în HTML
- [x] Stiluri diferite: culoare, dimensiune, weight, italic
- [x] Hover effects
- [x] Elemente distincte: variabile vs numere vs operatori

### Bonus 2 - Hamburger Menu
- [ ] 3 `<span>` în container `.burger-btn`
- [ ] Pozitionare absolută
- [ ] Background, width, height
- [ ] Display numai pe ecrane mici

### Bonus 2 - Hamburger Animation
- [ ] Animație de apariție pe ecran mic
- [ ] Minim 3 keyframes cheie
- [ ] Culoare, transformare geometrică, opacitate
- [ ] Smooth transition

### Bonus 2 - Successive Animations
- [ ] SCSS @for loop pentru 3 bare
- [ ] 300ms delay între fiecare
- [ ] Animație individuală per bară
- [ ] Efect staggered vizibil

---

## 🔗 Referințe și Resurse

- **CSS Reset:** https://meyerweb.com/eric/tools/css/reset/
- **MathML Elements:** https://developer.mozilla.org/en-US/docs/Web/MathML
- **SCSS @for:** https://sass-lang.com/documentation/at-rules/control/for
- **CSS Animations:** https://developer.mozilla.org/en-US/docs/Web/CSS/animation
- **Absolute Positioning:** https://developer.mozilla.org/en-US/docs/Web/CSS/position

---

## 📂 Structura Fișierelor Finale

```
Cinemania/
├── index.html
│   └── Secțiunea "Calculator Preț Bilet" (liniile 214-240)
│       └── Formula MathML corect structurată cu <mrow> și <msub>
├── css/
│   ├── general.css (liniile 582-635)
│   │   └── CSS styling pentru MathML (9 ruleset-uri)
│   ├── reset.css (NUEVO - CSS Reset)
│   └── potential.css
├── scss/
│   ├── main.scss
│   ├── _responsive-nav.scss (cu hamburger & animations - TO UPDATE)
│   └── ...
└── BONUS_IMPLEMENTATION.md (acest ghid)
```

---

## 🔍 Detalii Implementare - unde să cauți

### MathML Styling - Unde se găsește

**HTML:** [index.html](index.html#L214) - Secțiunea "Calculator Preț Bilet"
```html
<section id="locatii">
    <h2>Calculator Preț Bilet</h2>
    <div class="formula-box">
        <p><strong>Formula Preț Bilet:</strong></p>
        <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
            <mrow>...</mrow>
        </math>
    </div>
</section>
```

**CSS:** [css/general.css](css/general.css#L582) - Liniile 582-635
- `math { ... }` - Layout block și marjă
- `math mrow { ... }` - Flexbox pentru layout orizontal
- `math mi { ... }` - Stiluri pentru variabile (aur, italic, bold)
- `math mn { ... }` - Stiluri pentru numere (roșu, bold)
- `math mo { ... }` - Stiluri pentru operatori (alb, spațiat)
- `math msub { ... }` - Stiluri pentru subscripți
- `math msub > mi:first-child { ... }` - Base al subscriptului
- `math msub > mi:last-child { ... }` - Label subscript (light blue, mic)
- Hover effects pe `.formula-box math:hover mi` și `.formula-box math:hover mn`
