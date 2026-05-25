window.addEventListener("DOMContentLoaded", function () {
    // Referințe la elemente
    const containerProduse = document.getElementById("grid-produse");
    if (!containerProduse) return;

    // Păstrăm ordinea originală a elementelor pentru resetare
    let elementeOriginale = Array.from(document.querySelectorAll(".produs-card"));

    // Setăm label-ul dinamic pentru input range
    const inpPret = document.getElementById("inp-pret");
    const valPretLabel = document.getElementById("valoare-pret");
    if (inpPret && valPretLabel) {
        valPretLabel.textContent = inpPret.value;
        inpPret.oninput = function () {
            valPretLabel.textContent = this.value;
        };
    }

    // Validare dinamică pentru numele introdus (roșu dacă e doar spațiu)
    const inpNumeEl = document.getElementById("inp-nume");
    if (inpNumeEl) {
        inpNumeEl.addEventListener("input", function () {
            if (this.value.length > 0 && this.value.trim() === "") {
                this.classList.add("is-invalid");
            } else {
                this.classList.remove("is-invalid");
            }
        });
    }

    // CERINȚA B: Validare dinamică textarea și setare automată/corectare floating label 'is-invalid'
    const inpDescriereEl = document.getElementById("inp-descriere");
    if (inpDescriereEl) {
        inpDescriereEl.addEventListener("input", function () {
            if (this.value.length > 0 && this.value.trim() === "") {
                this.classList.add("is-invalid");
            } else {
                this.classList.remove("is-invalid");
            }
        });
    }

    // ----- Validarea Inputurilor -----
    function valideazaInputuri() {
        const inpNumeEl = document.getElementById("inp-nume");
        if (inpNumeEl) {
            const valNumeRaw = inpNumeEl.value;
            if (valNumeRaw.length > 0 && valNumeRaw.trim() === "") {
                inpNumeEl.classList.add("is-invalid");
                alert("Eroare: Căutarea după nume conține doar spații!");
                return false;
            } else {
                inpNumeEl.classList.remove("is-invalid");
            }

            const inpNume = valNumeRaw.trim();
            if (inpNume !== "") {
                // Numele nu ar trebui sa aiba cifre in acest context de cautare daca impunem o regula restrictiva,
                // Dar numele filmelor (ex. "Dune 2") au cifre. Deci validam sa nu fie DOAR cifre sau caractere speciale.
                // Pentru exercitiu, o validare simpla: sa nu inceapa cu un caracter special
                if (/^[^a-zA-Z0-9]/.test(inpNume)) {
                    alert("Eroare: Numele introdus nu poate începe cu un caracter special.");
                    return false;
                }
            }
        }

        const inpDescriere = document.getElementById("inp-descriere");
        if (inpDescriere) {
            const val = inpDescriere.value;
            if (val.length > 0 && val.trim() === "") {
                inpDescriere.classList.add("is-invalid");
                alert("Eroare: Descrierea introdusă conține doar spații!");
                return false;
            } else {
                inpDescriere.classList.remove("is-invalid");
            }
        }

        const inpLuni = document.getElementById("inp-luna-lansare");
        if (inpLuni && inpLuni.selectedOptions.length === 0) {
            alert("Eroare: Trebuie să selectați cel puțin o lună de lansare!");
            return false;
        }

        return true;
    }

    // ----- Filtrare -----
    document.getElementById("btn-filtrare").onclick = function () {
        if (!valideazaInputuri()) return;

        // Preluam valorile
        const valNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        const valPretMax = parseFloat(document.getElementById("inp-pret").value);
        const valFormat = document.getElementById("inp-format").value.toLowerCase();
        const valRating = document.querySelector('input[name="rad-rating"]:checked').value;
        const valVoucher = document.getElementById("inp-voucher").checked;
        const valDescriere = document.getElementById("inp-descriere").value.toLowerCase().trim();
        const valDurata = document.getElementById("inp-durata").value;

        const optiuniLuni = document.getElementById("inp-luna-lansare").selectedOptions;
        let luniSelectate = [];
        for (let opt of optiuniLuni) {
            luniSelectate.push(parseInt(opt.value));
        }

        let articole = document.querySelectorAll(".produs-card");
        for (let art of articole) {
            art.style.display = "none"; // Ascundem by default

            // Preluam valorile din DOM pentru articol
            const numeF = art.querySelector("h3 a").textContent.toLowerCase();
            const pretF = parseFloat(art.querySelector(".val-pret").textContent);
            const formatF = art.querySelector(".val-format").textContent.trim().toLowerCase();
            const ratingF = art.querySelector(".val-rating").textContent.trim();
            const voucherF = art.querySelector(".val-voucher").textContent.trim() === "Da";
            const descriereF = art.querySelector(".val-descriere").textContent.trim().toLowerCase();
            const durataF = parseInt(art.querySelector(".val-durata").textContent.trim());

            // Pentru Data, trebuie sa extragem luna
            // Tag-ul time are un datetime de forma ISO ("2024-03-01T00:00:00.000Z")
            const timeEl = art.querySelector("time");
            const dataIso = timeEl ? timeEl.getAttribute("datetime") : null;
            let lunaF = -1;
            if (dataIso) {
                lunaF = new Date(dataIso).getMonth(); // 0 pentru Ian, 11 pt Dec
            }

            // Conditii de filtrare
            let condNume = numeF.includes(valNume);
            let condPret = pretF <= valPretMax;
            let condFormat = (valFormat === "") || (formatF === valFormat);
            let condRating = (valRating === "toate") || (ratingF === valRating);
            let condVoucher = valVoucher ? voucherF === true : true; // Daca bifa nu e pusa, le accepta pe toate
            let condDescriere = valDescriere === "" || descriereF.includes(valDescriere);

            let condDurata = true;
            if (valDurata !== "oricare") {
                condDurata = durataF >= parseInt(valDurata);
            }

            let condLuna = luniSelectate.includes(lunaF);

            // Daca toate conditiile sunt indeplinite, se afiseaza
            // conditiile sunt default oricum deci asta e true si la setarea niciunui filtru
            if (condNume && condPret && condFormat && condRating && condVoucher && condDescriere && condDurata && condLuna) {
                art.style.display = "block";
            }
        }
    };

    // ----- Sortare -----
    function sorteaza(semn) {
        if (!valideazaInputuri()) return;

        let articole = Array.from(document.querySelectorAll(".produs-card"));

        articole.sort(function (a, b) {
            let pretA = parseFloat(a.querySelector(".val-pret").textContent);
            let pretB = parseFloat(b.querySelector(".val-pret").textContent);

            if (pretA === pretB) {
                // Cheia secundara: Numarul de limbi audio (separate prin virgula)
                let limbiA = a.querySelector(".val-limbi").textContent.split(",").length;
                let limbiB = b.querySelector(".val-limbi").textContent.split(",").length;

                return semn * (limbiA - limbiB);
            }
            return semn * (pretA - pretB);
        });

        // Reatasam elementele in parinte (append in dom muta elementul)
        for (let art of articole) {
            containerProduse.appendChild(art);
        }
    }

    document.getElementById("btn-sort-asc").onclick = function () {
        sorteaza(1);
    };

    document.getElementById("btn-sort-desc").onclick = function () {
        sorteaza(-1);
    };

    // ----- Calculare (Medie pret elemente AFISATE) -----
    document.getElementById("btn-calculeaza").onclick = function () {
        if (!valideazaInputuri()) return;

        let articole = document.querySelectorAll(".produs-card");
        let suma = 0;
        let nr = 0;

        for (let art of articole) {
            // getComputedStyle returneaza "none" daca e ascuns, sau "block"/"flex" etc altfel
            if (window.getComputedStyle(art).display !== "none") {
                suma += parseFloat(art.querySelector(".val-pret").textContent);
                nr++;
            }
        }

        let medie = nr > 0 ? (suma / nr).toFixed(2) : 0;

        // Creare div fix
        let div = document.createElement("div");
        div.id = "div-calcul";
        div.innerHTML = `Prețul mediu al filmelor afișate: <strong>${medie} RON</strong> (bazat pe ${nr} filme)`;
        document.body.appendChild(div);

        // Dispare dupa 2 secunde
        setTimeout(function () {
            if (div) {
                div.remove();
            }
        }, 2000);
    };

    document.getElementById("btn-reset").onclick = function () {
        let ok = confirm("Sunteți sigur că doriți resetarea tuturor filtrelor și anularea sortării?");
        if (ok) {
            // Dacă pagina a fost filtrată la nivel de server (ex: /filme?tip=sf),
            // resetarea trebuie să reîncarce pagina fără parametrii de filtrare pentru a aduce toate filmele înapoi.
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has("tip")) {
                window.location.href = "/filme";
                return;
            }

            // Resetam filtrele vizuale
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = 100;
            document.getElementById("valoare-pret").textContent = 100;
            document.getElementById("inp-format").value = "";

            // Radio: punem primul ca checked ("toate")
            document.querySelector('input[name="rad-rating"][value="toate"]').checked = true;

            document.getElementById("inp-voucher").checked = false;
            const inpDesc = document.getElementById("inp-descriere");
            if (inpDesc) {
                inpDesc.value = "";
                inpDesc.classList.remove("is-invalid");
            }
            document.getElementById("inp-durata").value = "oricare";

            // Multiple select - bifam totul inapoi
            let optiuniLuni = document.getElementById("inp-luna-lansare").options;
            for (let opt of optiuniLuni) {
                opt.selected = true;
            }

            // Refacem ordinea initiala
            for (let art of elementeOriginale) {
                art.style.display = "block";
                containerProduse.appendChild(art);
            }
        }
    };
});
