# Ghid prezentare etapa 4 bonus — Validare [erori.json](erori.json)

## Intrebari frecvente ale profesoarei (FAQ)

### "De ce avem o functie separata de validare?"
Validarea este in `verificareEroriJson()` si ruleaza imediat la pornire, inainte de initializarea rutelor. Asa depistam rapid erorile de configurare si afisam mesaje explicite despre ce trebuie corectat.

### "De ce verificam chei duplicate pe string, nu pe obiect?"
`JSON.parse()` pastreaza doar ultima aparitie a unei chei duplicate. De aceea parcurgem string-ul brut pentru a detecta cheile repetate care s-ar pierde la parsare.

### "Cand se opreste serverul?"
Daca lipseste fisierul sau JSON-ul este invalid, aplicatia se opreste imediat cu `process.exit()` pentru a evita rularea intr-o stare incompleta.

## Task-uri detaliate etapa 4 bonus

### Validare [erori.json](erori.json)

**Unde se afla in cod:**
- Functia de validare: [index.js](index.js#L124-L380)
- Apel la pornirea serverului: [index.js](index.js#L525)
- Datele verificate: [erori.json](erori.json)
- Imaginile de eroare: [resurse/imagini/erori](resurse/imagini/erori)

#### Structura logica (pe scurt)
```javascript
function verificareEroriJson() {
  // A: fisierul lipseste -> afisare + process.exit()
  // B: proprietati lipsa in obiectul principal
  // C: proprietati lipsa in eroare_default
  // D: folderul din cale_baza nu exista
  // E: imaginile definite in erori nu exista
  // F: chei duplicate in acelasi obiect (scanare string brut)
  // G: identificatori duplicati in info_erori
}
```

#### Corespondenta cerinte
- (0.025) Lipsa fisierului + `process.exit()`: [index.js](index.js#L129-L140)
- (0.025) Lipsa `info_erori`, `cale_baza`, `eroare_default`: [index.js](index.js#L155-L168)
- (0.025) Lipsa `titlu`, `text`, `imagine` in `eroare_default`: [index.js](index.js#L170-L185)
- (0.025) Folderul din `cale_baza` nu exista: [index.js](index.js#L187-L200)
- (0.05) Fisiere imagine lipsa pentru erori: [index.js](index.js#L203-L234)
- (0.2) Chei duplicate in acelasi obiect JSON (verificare pe string): [index.js](index.js#L238-L341)
- (0.15) Identificatori duplicati + listare proprietati fara `identificator`: [index.js](index.js#L343-L378)

## Datele folosite
- Fisierul de configurare: [erori.json](erori.json)
- Imagine default: [resurse/imagini/erori/default.png](resurse/imagini/erori/default.png)
- Imagine eroare 400: [resurse/imagini/erori/400.png](resurse/imagini/erori/400.png)
- Imagine eroare 403: [resurse/imagini/erori/403.png](resurse/imagini/erori/403.png)
- Imagine eroare 404: [resurse/imagini/erori/404.png](resurse/imagini/erori/404.png)
- Imagine eroare 500: [resurse/imagini/erori/500.png](resurse/imagini/erori/500.png)

## Observatii
- Mesajele de eroare sunt clare si includ pasii de remediere.
- Validarea ruleaza inainte de `initErori()`, deci problemele sunt raportate imediat la pornire.
