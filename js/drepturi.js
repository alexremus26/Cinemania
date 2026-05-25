const Drepturi = {
    // Drepturi referitoare la Produse (Filme)
    vizualizareProduse: Symbol("vizualizareProduse"),
    modificareProduse: Symbol("modificareProduse"),
    adaugareProduse: Symbol("adaugareProduse"),
    stergereProduse: Symbol("stergereProduse"),

    // Drepturi referitoare la Utilizatori și Profil
    vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
    modificareUtilizatori: Symbol("modificareUtilizatori"),
    stergereUtilizatori: Symbol("stergereUtilizatori"),

    // Drepturi specifice activităților comerciale
    cumparareProduse: Symbol("cumparareProduse")
};

// Exportăm obiectul Drepturi
module.exports = Drepturi;
