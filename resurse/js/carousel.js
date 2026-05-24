/* Identificator: bootstrap_js_ */

document.addEventListener("DOMContentLoaded", function () {
    // -------------------------------------------------------------
    // 1. Gestionare Cookie Personalizat ("ultimul_film") pe Acasă
    // -------------------------------------------------------------
    const welcomeCookieContainer = document.getElementById("welcome-cookie-container");
    const welcomeCookieLink = document.getElementById("welcome-cookie-link");
    const btnClearWelcomeCookie = document.getElementById("btn-clear-welcome-cookie");

    if (welcomeCookieContainer && welcomeCookieLink && btnClearWelcomeCookie) {
        const lastFilmStr = typeof getCookie === "function" ? getCookie("ultimul_film") : null;
        if (lastFilmStr) {
            try {
                const lastFilm = JSON.parse(lastFilmStr);
                if (lastFilm && lastFilm.id && lastFilm.nume) {
                    welcomeCookieLink.href = "/film/" + lastFilm.id;
                    welcomeCookieLink.textContent = lastFilm.nume;
                    welcomeCookieContainer.classList.remove("d-none");
                }
            } catch (e) {
                console.error("[COOKIE] Eroare la parsarea cookie-ului ultimul_film:", e);
            }
        }

        btnClearWelcomeCookie.addEventListener("click", function () {
            if (typeof deleteCookie === "function") {
                deleteCookie("ultimul_film");
            }
            welcomeCookieContainer.style.transition = "opacity 0.3s ease";
            welcomeCookieContainer.style.opacity = "0";
            setTimeout(() => {
                welcomeCookieContainer.classList.add("d-none");
            }, 300);
        });
    }

    // -------------------------------------------------------------
    // 2. Rotire Dinamică Carusel prin AJAX (Fetch) la fiecare 15s
    // -------------------------------------------------------------
    const carouselEl = document.getElementById("carousel-filme");
    if (carouselEl) {
        // Inițializăm caruselul din Bootstrap (fără auto-rotire nativă rapidă a Bootstrap)
        const carouselInstance = new bootstrap.Carousel(carouselEl, {
            ride: false,
            interval: false
        });

        // Setăm intervalul de 15 secunde pentru a încărca dinamic noi filme
        setInterval(updateCarouselData, 15000);
    }

    /**
     * Efectuează apelul AJAX pentru a obține 5 filme noi aleatorii și actualizează DOM-ul
     */
    async function updateCarouselData() {
        try {
            console.log("[CAROUSEL] Se încarcă filme noi aleatorii...");
            const res = await fetch("/api/filme/aleatorii");
            if (!res.ok) throw new Error("Răspuns server necorespunzător");

            const filme = await res.json();
            if (!Array.isArray(filme) || filme.length === 0) {
                console.warn("[CAROUSEL] Nu s-au primit filme din baza de date.");
                return;
            }

            const inner = document.getElementById("carousel-inner");
            const indicators = document.getElementById("carousel-indicators");

            if (inner && indicators) {
                // Efect fluid de fade out
                inner.style.transition = "opacity 0.4s ease";
                inner.style.opacity = "0";

                setTimeout(() => {
                    // 1. Reconstrucție Indicatori
                    let indicatorsHtml = "";
                    for (let i = 0; i < filme.length; i++) {
                        indicatorsHtml += `<button type="button" data-bs-target="#carousel-filme" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-current="${i === 0 ? 'true' : 'false'}" aria-label="Slide ${i + 1}"></button>`;
                    }
                    indicators.innerHTML = indicatorsHtml;

                    // 2. Reconstrucție Slide-uri
                    let slidesHtml = "";
                    filme.forEach((film, index) => {
                        const catMare = film.categorie_mare.charAt(0).toUpperCase() + film.categorie_mare.slice(1);
                        slidesHtml += `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}" data-film-id="${film.id}">
                                <img src="${film.imagine}" class="d-block w-100" alt="Poster ${film.nume}">
                                <div class="carousel-caption">
                                    <h3>${film.nume}</h3>
                                    <div class="carousel-meta">
                                        <span><i class="fa-solid fa-tags"></i> ${catMare} / ${film.categorie_minora}</span>
                                        <span><i class="fa-solid fa-clock"></i> ${film.durata_minute} min</span>
                                        <span><i class="fa-solid fa-ticket"></i> ${film.pret} RON</span>
                                    </div>
                                    <p class="descriere-film">${film.descriere}</p>
                                    <a href="/film/${film.id}" class="btn btn-view-movie">Detalii Film</a>
                                </div>
                            </div>
                        `;
                    });
                    inner.innerHTML = slidesHtml;

                    // 3. Re-sincronizare instanță carusel și resetare pe primul slide
                    const activeCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
                    activeCarousel.to(0);

                    // Efect fluid de fade in
                    inner.style.opacity = "1";
                    console.log("[CAROUSEL] Datele caruselului au fost reîmprospătate cu succes.");
                }, 400);
            }
        } catch (error) {
            console.error("[CAROUSEL ERROR] Eroare la actualizarea AJAX a caruselului:", error);
        }
    }
});
