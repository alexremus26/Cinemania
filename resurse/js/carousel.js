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
        // Inițializăm caruselul din Bootstrap (fără auto-rotire nativă a Bootstrap)
        const carouselInstance = new bootstrap.Carousel(carouselEl, {
            ride: false,
            interval: false
        });

        // Setăm intervalul de 15 secunde pentru a încărca dinamic noi filme
        setInterval(updateCarouselData, 15000);
    }

    async function updateCarouselData() {
        try {
            // Preluăm 5 filme aleatorii de la endpoint-ul API
            const res = await fetch("/api/filme/aleatorii");
            const filme = await res.json();

            const inner = document.getElementById("carousel-inner");
            const indicators = document.getElementById("carousel-indicators");

            if (inner && indicators) {
                // 1. Reconstrucție Indicatori
                let indicatorsHtml = "";
                for (let i = 0; i < filme.length; i++) {
                    indicatorsHtml += `<button type="button" data-bs-target="#carousel-filme" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}"></button>`;
                }
                indicators.innerHTML = indicatorsHtml;

                // 2. Reconstrucție Slide-uri (Imagine + Captiune cu Nume, Categorie, Pret)
                let slidesHtml = "";
                filme.forEach((film, index) => {
                    slidesHtml += `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <img src="${film.imagine}" class="d-block w-100" alt="${film.nume}">
                            <div class="carousel-caption">
                                <h3>${film.nume}</h3>
                                <p>Gen: ${film.categorie_mare} | Preț: ${film.pret} RON</p>
                            </div>
                        </div>
                    `;
                });
                inner.innerHTML = slidesHtml;

                // 3. Resetăm caruselul pe primul slide
                const activeCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
                activeCarousel.to(0);
            }
        } catch (error) {
            console.error("Eroare la actualizarea AJAX a caruselului:", error);
        }
    }
});
