CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email varchar(255) NOT NULL,
    firstname varchar(255) NOT NULL,
    lastname varchar(255) NOT NULL,
    street varchar(255) NOT NULL,
    house_number int NOT NULL,
    postal_code int NOT NULL,
    password varchar(255));

INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, password) VALUES ('max.musterman@test.de','max','musterman', 'In der Straße', 10, 50667, 'test123'),
                                                                                         ('lisa.musterfrau@test.de','lisa','musterfrau', 'An der Gasse', 24, 10115, 'test123'),
                                                                                         ('tim.hoeffner@test.de','tim','hoeffner', 'Am Hof', 13, 53783, 'test123');
