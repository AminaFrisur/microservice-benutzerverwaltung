CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    email varchar(255) NOT NULL,
    firstname varchar(255) NOT NULL,
    lastname varchar(255) NOT NULL,
    street varchar(255) NOT NULL,
    house_number int NOT NULL,
    postal_code int NOT NULL,
    login_name varchar(255) PRIMARY KEY,
    password varchar(255) NOT NULL,
    auth_token varchar(255),
    auth_token_timestamp timestamp);

INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, login_name, password) VALUES ('max.musterman@test.de','max','musterman', 'In der Straße', 10, 50667, 'testuser1', 'test123'),
                                                                                                              ('lisa.musterfrau@test.de','lisa','musterfrau', 'An der Gasse', 24, 10115, 'testuser2', 'test123'),
                                                                                                              ('tim.hoeffner@test.de','tim','hoeffner', 'Am Hof', 13, 53783, 'testuser3','test123');
