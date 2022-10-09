CREATE TABLE IF NOT EXISTS benutzer (
    id SERIAL PRIMARY KEY,
    email varchar(255) NOT NULL,
    vorname varchar(255) NOT NULL,
    nachname varchar(255) NOT NULL,
    straße varchar(255) NOT NULL,
    hausnummer int NOT NULL,
    plz int NOT NULL,
    passwort varchar(255));

INSERT INTO benutzer(email, vorname, nachname, straße, hausnummer, plz, passwort) VALUES ('max.musterman@test.de','max','musterman', 'In der Straße', 10, 50667, 'test123'),
                                                                                         ('lisa.musterfrau@test.de','lisa','musterfrau', 'An der Gasse', 24, 10115, 'test123'),
                                                                                         ('tim.hoeffner@test.de','tim','hoeffner', 'Am Hof', 13, 53783, 'test123');
