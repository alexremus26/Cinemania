DROP DATABASE IF EXISTS cinemania;
DROP USER IF EXISTS cinemania_user;

CREATE USER cinemania_user WITH PASSWORD 'cinemania_pass';
CREATE DATABASE cinemania OWNER cinemania_user;

\c cinemania;

CREATE TYPE gen_film AS ENUM ('actiune', 'comedie', 'drama', 'sf', 'groaza');

CREATE TABLE filme (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(255) NOT NULL,
    descriere TEXT NOT NULL,
    imagine VARCHAR(255) NOT NULL,
    categorie_mare gen_film NOT NULL, 
    categorie_minora VARCHAR(50), -- format: 2D,3D..
    pret NUMERIC(10, 2) NOT NULL,
    durata_minute INTEGER NOT NULL,
    data_lansare DATE NOT NULL,
    rating_varsta VARCHAR(10) NOT NULL,
    limbi_audio VARCHAR(255) NOT NULL,
    permite_voucher BOOLEAN NOT NULL DEFAULT false
);

GRANT ALL PRIVILEGES ON DATABASE cinemania TO cinemania_user;
GRANT ALL PRIVILEGES ON TABLE filme TO cinemania_user;
GRANT USAGE, SELECT ON SEQUENCE filme_id_seq TO cinemania_user;

CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nume VARCHAR(50) NOT NULL,
    prenume VARCHAR(50) NOT NULL,
    parola VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    culoare_chat VARCHAR(50) NOT NULL DEFAULT 'black',
    poza VARCHAR(255),
    cod VARCHAR(255),
    rol VARCHAR(50) NOT NULL DEFAULT 'comun'
);

GRANT ALL PRIVILEGES ON TABLE utilizatori TO cinemania_user;
GRANT USAGE, SELECT ON SEQUENCE utilizatori_id_seq TO cinemania_user;

INSERT INTO utilizatori (username, nume, prenume, parola, email, culoare_chat, poza, rol) VALUES
('admin', 'Admin', 'Cinemania', '8569a6112ae11ac1daab48610acf3e7f4930c6246014085556ea109225b13c6bcd9de791d4b0d343a7ca25e7b8367a82c48918893dfe5d9c37e004b907764868', 'admin@cinemania.com', 'red', '/resurse/imagini/utilizatori/admin.jpg', 'admin'),
('client1', 'Popescu', 'Ion', '09145f6f19fbf1612c549c817047fb7860aa61f83bceb77de502bb42c8a771da69841d5d8be46e7694ce3744da68b7bc54b7ff3f13b03731ab7c6c3562f1e2b7', 'ion.popescu@gmail.com', 'blue', '/resurse/imagini/utilizatori/client1.jpg', 'comun'),
('moderator1', 'Ionescu', 'Vasile', '8e430ab828e5b93ea6ee1c47ff1bec4134d57cc1900bf09db966e47a43dae5cb7566053376771da0d6f67bae2358882efc1347a176b4a63371e7e4caa1175cb8', 'vasile.ionescu@gmail.com', 'green', '/resurse/imagini/utilizatori/moderator1.jpg', 'moderator');


INSERT INTO filme (nume, descriere, imagine, categorie_mare, categorie_minora, pret, durata_minute, data_lansare, rating_varsta, limbi_audio, permite_voucher) VALUES
('Furiosa', 'O poveste epica plasata in universul Mad Max, in care Furiosa lupta pentru supravietuire intr-o lume post-apocaliptica dura si nemiloasa.', '/resurse/imagini/filme/furiosa.jpg', 'actiune', 'IMAX', 45.00, 148, '2024-05-24', 'N15', 'Ro,En,Hu', false),
('Back to the Future', 'Un adolescent este trimis accidental in trecut cu ajutorul unei masini a timpului construite de prietenul sau excentric.', '/resurse/imagini/filme/backtothefuture.jpg', 'sf', '2D', 35.00, 116, '1985-07-03', 'AG', 'En,Ro', false),
('Deadpool & Wolverine', 'Cei mai indragiti anti-eroi din universul Marvel fac echipa intr-o comedie de actiune plina de umor negru si spargerea celui de-al patrulea perete.', '/resurse/imagini/filme/deadpool.jpg', 'comedie', '3D', 40.00, 127, '2024-07-26', 'IM18', 'En,Hu', false),
('Inside Out 2', 'Emotiile din mintea lui Riley se confrunta cu noi provocari odata cu trecerea in adolescenta si aparitia unor noi sentimente complexe.', '/resurse/imagini/filme/insideout2.jpg', 'comedie', '2D', 35.00, 96, '2024-06-14', 'AG', 'Ro,En,De', true),
('Oppenheimer', 'Povestea fascinanta a lui J. Robert Oppenheimer si rolul sau in dezvoltarea bombei atomice, explorand dilemele morale si consecintele actiunilor sale.', '/resurse/imagini/filme/oppenheimer.jpg', 'drama', 'IMAX', 45.00, 180, '2023-07-21', 'AP12', 'En,Ro,Fr', false),
('Alien Romulus', 'Un grup de tineri colonisti spatiali, explorand o statie spatiala abandonata, se confrunta cu cea mai terifianta forma de viata din univers.', '/resurse/imagini/filme/alienromulus.jpg', 'groaza', '2D', 38.00, 119, '2024-08-16', 'N15', 'En', false),
('Gladiator 2', 'La ani distanta de la evenimentele din primul film, o noua generatie de gladiatori intra in arena, luptand pentru onoare si libertate.', '/resurse/imagini/filme/gladiator2.jpg', 'actiune', '4DX', 55.00, 150, '2024-11-22', 'N15', 'En,Ro', true),
('The Substance', 'Un thriller psihologic ce exploreaza obsesia pentru tinerete, folosind o substanta experimentala care permite crearea unei versiuni mai tinere a sinelui.', '/resurse/imagini/filme/substance.jpg', 'groaza', '2D', 35.00, 110, '2024-09-20', 'IM18', 'En,Fr', false),
('Interstellar', 'O echipa de exploratori calatoreste printr-o gaura de vierme in spatiu intr-o incercare disperata de a gasi o noua casa pentru omenire.', '/resurse/imagini/filme/interstellar.jpg', 'sf', 'IMAX', 45.00, 169, '2014-11-07', 'AG', 'En,Ro,Es', true),
('Joker: Folie a Deux', 'Arthur Fleck revine, de data aceasta alaturandu-se lui Harley Quinn intr-o poveste intunecata despre nebunie impartasita, intr-un format muzical inedit.', '/resurse/imagini/filme/joker2.jpg', 'drama', '2D', 40.00, 138, '2024-10-04', 'N15', 'En,Ro', false),
('Smile 2', 'Teroarea continua atunci cand o entitate demonica care se hraneste cu trauma se raspandeste, trecand de la o victima la alta prin zambete sinistre.', '/resurse/imagini/filme/smile2.jpg', 'groaza', '2D', 35.00, 115, '2024-10-18', 'N15', 'En', false),
('Kingdom of the Planet of the Apes', 'La generatii dupa Cezar, maimutele sunt specia dominanta, iar oamenii traiesc in salbaticie. Un tanar cimpanzeu porneste intr-o calatorie de descoperire.', '/resurse/imagini/filme/apes.jpg', 'actiune', '3D', 40.00, 145, '2024-05-10', 'AP12', 'En,Ro', true),
('Kung Fu Panda 4', 'Po, acum Lider Spiritual al Vaii Pacii, trebuie sa aleaga un nou Razboinic Dragon, in timp ce se confrunta cu o noua amenintare formidabila.', '/resurse/imagini/filme/kungfupanda4.jpg', 'comedie', '3D', 38.00, 94, '2024-03-08', 'AG', 'Ro,En,Hu,De', true),
('The Batman', 'Un Bruce Wayne tanar investigheaza crimele sadice ale lui Riddler in Gotham City, explorand coruptia profunda ce ii afecteaza propria familie.', '/resurse/imagini/filme/batman.jpg', 'actiune', 'IMAX', 45.00, 176, '2022-03-04', 'AP12', 'En,Ro', false),
('Avatar: The Way of Water', 'Jake Sully si familia sa se confrunta cu noi pericole pe Pandora, explorand oceanele planetei si luptand din nou impotriva invaziei umane.', '/resurse/imagini/filme/avatar2.jpg', 'sf', '3D', 50.00, 192, '2022-12-16', 'AP12', 'En,Ro,Fr', true),
('A Quiet Place: Day One', 'Descopera cum lumea a cazut in tacere odata cu primele momente ale invaziei extraterestrilor cu auz hipersensibil, aducand panica in oras.', '/resurse/imagini/filme/quietplace.jpg', 'groaza', 'IMAX', 45.00, 100, '2024-06-28', 'N15', 'En,Ro', false),
('Challengers', 'Trei jucători de tenis se reîntâlnesc într-un turneu, dezvăluind un trecut complicat de iubire și rivalitate.', '/resurse/imagini/filme/challengers.jpg', 'drama', '2D', 40.00, 131, '2024-04-26', 'N15', 'En,Ro', false),
('Dune', 'Prima parte a epopeii spatiale în care familia Atreides este atrasă într-o cursă mortală pentru controlul planetei Arrakis.', '/resurse/imagini/filme/dune.jpg', 'sf', 'IMAX', 45.00, 155, '2021-10-22', 'AP12', 'En,Ro,Fr', true),
('Fight Club', 'Un corporatist insomniac formează un club de lupte subteran alături de un vânzător de săpun anarhist.', '/resurse/imagini/filme/fightclub.jpg', 'drama', '2D', 35.00, 139, '1999-10-15', 'IM18', 'En,Ro', false),
('La Haine', 'Povestea a 24 de ore din viața a trei tineri din suburbiile Parisului după o noapte de revolte violente.', '/resurse/imagini/filme/lahaine.jpg', 'drama', '2D', 38.00, 98, '1995-05-31', 'IM18', 'Fr,Ro', false),
('Marty Supreme', 'Viața unui jucător profesionist de tenis de masă și provocările sale în circuitul internațional.', '/resurse/imagini/filme/martysupreme.jpg', 'comedie', '4DX', 40.00, 110, '2025-02-14', 'AP12', 'En,Ro', true),
('No Country for Old Men', 'Un vânător găsește o geantă cu bani din droguri, fiind urmărit de un asasin psihopat necruțător.', '/resurse/imagini/filme/nocountryforoldmen.jpg', 'actiune', '2D', 45.00, 122, '2007-11-09', 'IM18', 'En,Ro', false),
('No Other Choice', 'Un thriller tensionat unde protagonistul trebuie să ia o decizie imposibilă pentru a-și salva familia.', '/resurse/imagini/filme/nootherchoice.jpg', 'actiune', '3D', 42.00, 115, '2024-08-10', 'N15', 'En,Ro', true),
('Parasite', 'O familie săracă se infiltrează inteligent în casa unei familii bogate, ducând la consecințe imprevizibile.', '/resurse/imagini/filme/parasite.jpg', 'drama', '2D', 45.00, 132, '2019-11-08', 'N15', 'Ko,Ro', false),
('The Truman Show', 'Un agent de asigurări descoperă că întreaga sa viață este de fapt un reality show urmărit de milioane de oameni.', '/resurse/imagini/filme/thetrumanshow.jpg', 'comedie', '2D', 35.00, 103, '1998-06-05', 'AG', 'En,Ro', true),
('The Matrix', 'Un hacker descoperă că lumea sa este de fapt o simulare.', '/resurse/imagini/filme/matrix.jpg', 'sf', 'IMAX', 45.00, 136, '1999-03-31', 'AP12', 'En,Ro', false),
('Inception', 'Un hoț care fură secrete corporative prin utilizarea tehnologiei viselor.', '/resurse/imagini/filme/inception.jpg', 'sf', 'IMAX', 50.00, 148, '2010-07-16', 'AP12', 'En,Ro', true),
('The Godfather', 'Liderul în vârstă al unei dinastii de crimă organizată.', '/resurse/imagini/filme/godfather.jpg', 'drama', '2D', 40.00, 175, '1972-03-24', 'IM18', 'En,Ro', false),
('The Dark Knight', 'Amenințarea cunoscută sub numele de Joker provoacă haos.', '/resurse/imagini/filme/darkknight.jpg', 'actiune', 'IMAX', 45.00, 152, '2008-07-18', 'AP12', 'En,Ro', false),
('Forrest Gump', 'Evenimentele majore din istoria SUA prin ochii unui om simplu.', '/resurse/imagini/filme/forrestgump.jpg', 'drama', '2D', 35.00, 142, '1994-07-06', 'AG', 'En,Ro', true),
('Star Wars: A New Hope', 'Luke Skywalker face echipă cu un Jedi pentru a salva galaxia.', '/resurse/imagini/filme/starwars.jpg', 'sf', '3D', 45.00, 121, '1977-05-25', 'AG', 'En,Ro', false),
('The Avengers', 'Cei mai puternici eroi trebuie să se adune pentru a opri o armată extraterestră.', '/resurse/imagini/filme/avengers.jpg', 'actiune', '3D', 40.00, 143, '2012-05-04', 'AP12', 'En,Ro', true),
('Jurassic Park', 'Un parc tematic cu dinozauri clonați scapă de sub control.', '/resurse/imagini/filme/jurassicpark.jpg', 'sf', '2D', 38.00, 127, '1993-06-11', 'AP12', 'En,Ro', false),
('Spider-Man: No Way Home', 'Peter Parker îi cere ajutorul Doctorului Strange.', '/resurse/imagini/filme/spiderman.jpg', 'actiune', '3D', 50.00, 148, '2021-12-17', 'AP12', 'En,Ro', true),
('Shrek', 'Un căpcăun morocănos pornește într-o misiune pentru a salva o prințesă.', '/resurse/imagini/filme/shrek.jpg', 'comedie', '2D', 35.00, 90, '2001-05-18', 'AG', 'En,Ro', true),
('Toy Story', 'Aventurile lui Woody și Buzz Lightyear.', '/resurse/imagini/filme/toystory.jpg', 'comedie', '3D', 35.00, 81, '1995-11-22', 'AG', 'En,Ro', false),
('Titanic', 'O poveste de dragoste la bordul legendarului R.M.S. Titanic.', '/resurse/imagini/filme/titanic.jpg', 'drama', '3D', 45.00, 195, '1997-12-19', 'AP12', 'En,Ro', false),
('The Lord of the Rings', 'Un hobbit moștenește Inelul Unic și trebuie să-l distrugă.', '/resurse/imagini/filme/lotr.jpg', 'actiune', 'IMAX', 50.00, 178, '2001-12-19', 'AP12', 'En,Ro', true),
('Gladiator', 'Un general roman trădat caută răzbunare ca gladiator.', '/resurse/imagini/filme/gladiator.jpg', 'actiune', '2D', 40.00, 155, '2000-05-05', 'N15', 'En,Ro', false),
('Se7en', 'Doi detectivi vânează un criminal în serie obsedat de cele 7 păcate capitale.', '/resurse/imagini/filme/seven.jpg', 'groaza', '2D', 38.00, 127, '1995-09-22', 'IM18', 'En,Ro', false);