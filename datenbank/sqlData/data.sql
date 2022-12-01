CREATE USER 'root'@'%' IDENTIFIED BY 'test';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
CREATE DATABASE IF NOT EXISTS benutzerverwaltung;
USE benutzerverwaltung;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    `email` VARCHAR(50) NOT NULL,
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `street` VARCHAR(50) NOT NULL,
    `house_number` int NOT NULL,
    `postal_code` int NOT NULL,
    `login_name` VARCHAR(50),
    `password` VARCHAR(255) NOT NULL,
    `auth_token` VARCHAR(255),
    `auth_token_timestamp` TIMESTAMP,
    `active` boolean DEFAULT FALSE,
    `is_admin` boolean DEFAULT FALSE,
    PRIMARY KEY (`login_name`))
ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES users WRITE;
INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, login_name, password, active, is_admin) VALUES ('max.musterman@test.de','max','musterman', 'In der Straße', 10, 50667, 'testuser1', '$2b$10$HW8CNSIRetU/wv3FvNOHue6QM95DsZN6L199YkOuox8mpuCa2J9ZO', FALSE, FALSE),
                                                                                                              ('lisa.musterfrau@test.de','lisa','musterfrau', 'An der Gasse', 24, 10115, 'testuser2', '$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, FALSE),
                                                                                                              ('tim.hoeffner@test.de','tim','hoeffner', 'Am Hof', 13, 53783, 'testuser3','$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, FALSE),
                                                                                                              ('admin@test.de','Admin','Admin', 'Am Hof', 1, 10115, 'admin','$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, TRUE),
                                                                                                              ('admin2@test.de','Admin2','Admin2', 'Am Hof', 1, 10115, 'admin2','$2b$10$Cs2dQGJ5QzcegifzKDnkHeW2vhNpLlIlX1JD2AMkO0iQWMR18tOOK', FALSE, TRUE);
UNLOCK TABLES;
GRANT ALL PRIVILEGES ON benutzerverwaltung TO 'root'@'%' WITH GRANT OPTION;