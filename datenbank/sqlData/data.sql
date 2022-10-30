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
    auth_token_timestamp timestamp,
    active boolean DEFAULT FALSE,
    is_admin boolean DEFAULT FALSE);

INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, login_name, password, active, is_admin) VALUES ('max.musterman@test.de','max','musterman', 'In der Straße', 10, 50667, 'testuser1', '$2b$10$HW8CNSIRetU/wv3FvNOHue6QM95DsZN6L199YkOuox8mpuCa2J9ZO', FALSE, FALSE),
                                                                                                              ('lisa.musterfrau@test.de','lisa','musterfrau', 'An der Gasse', 24, 10115, 'testuser2', '$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, FALSE),
                                                                                                              ('tim.hoeffner@test.de','tim','hoeffner', 'Am Hof', 13, 53783, 'testuser3','$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, FALSE),
                                                                                                              ('admin@test.de','Admin','Admin', 'Am Hof', 1, 10115, 'admin','$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, TRUE);
