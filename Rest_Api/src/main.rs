
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
use postgres::{Client, NoTls};
use rocket_contrib::json::Json;
use serde::{Serialize, Deserialize};
use magic_crypt::{new_magic_crypt, MagicCryptTrait};

// TODO: GENEREAL:
// TODO: Implement Error Handling
// TODO: Authentifizierung innerhalb der MS Architektur noch festlegen
// TODO: Rust nightly -> Wirklich empfehlenswert fuer production? -> gibt es auch eine Alternative um rocket zu kompelieren ?

// TODO: Benutzerverwaltung:
// TODO: Passwort speichern: -> Dort mal bitte schauen ob MagicCrypt ausreichend ist ! -> Generell die Grundlagen zur Passwort verschlüsselung anschauen !
// TODO: Passwort Reset implementieren -> Dort mal bitte schauen ob MagicCrypt ausreichend ist ! -> Generell die Grundlagen zur Passwort verschlüsselung anschauen !
// TODO: rocket toml Datie anlegen um port auch zu wechseln
// TODO: Change reveiving port for postgres db
// TODO: Create Login function -> erstelle ein Auth Token dann -> dafür noch eine neue bib suchen !


fn create_users_list(query_result: Vec<postgres::row::Row>) -> Vec<User> {

    let mut vec_user : Vec<User> = Vec::new();

    for row in query_result {

        let user = User {
            id: row.get(0),
            email: row.get(1),
            firstname: row.get(2),
            lastname: row.get(3),
            street: row.get(4),
            house_number: row.get(5),
            postal_code: row.get(6),
            login_name: row.get(7)
        };
        vec_user.push(user);
    }
    return vec_user;
}

#[get("/getUsers")]
fn get_users() -> Json<Vec<User>> {
    let mut client = Client::connect("host=database port=5432 user=postgres password=test", NoTls).unwrap();
    let query_result = client.query("SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users", &[]).unwrap();
    return Json(create_users_list(query_result));
}

#[post("/changeUser", format = "json", data = "<user_json>")]
fn change_user(user_json: Json<User>) -> String {
    let user: User = user_json.into_inner();
    let mut client = Client::connect("host=database port=5432 user=postgres password=test", NoTls).unwrap();
    client.execute("UPDATE user SET email = $1, firstname = $2, lastname = $3 , street = $4 , house_number = $5 , postal_code = $6  WHERE id = $7",
                   &[&user.email, &user.firstname, &user.lastname, &user.street ,&user.house_number, &user.postal_code, &user.id]).unwrap();
    return format!("Updated successfully user with id: {}", user.id);
}

#[post("/register", format = "json", data = "<register_json>")]
fn register(register_json: Json<Register>) -> Json<Vec<User>> {
    let register: Register = register_json.into_inner();

    // encrypt password
    let mc = new_magic_crypt!("magickey", 256);
    let encrypted_password = String::from(mc.encrypt_str_to_base64(register.password));

    let mut client = Client::connect("host=database port=5432 user=postgres password=test", NoTls).unwrap();
    client.execute("INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, login_name, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                   &[&register.email, &register.firstname, &register.lastname, &register.street, &register.house_number, &register.postal_code, &register.login_name, &encrypted_password]).unwrap();
    let query_result = client.query("SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users ORDER BY id DESC LIMIT 1",
                                    &[]).unwrap();
    return Json(create_users_list(query_result));
}

fn main()  {
    rocket::ignite().mount("/", routes![get_users, register, change_user]).launch();
}

#[derive(Serialize, Deserialize, Debug)]
struct User {
    id: i32,
    email: String,
    firstname: String,
    lastname: String,
    street: String,
    house_number: i32,
    postal_code: i32,
    login_name: String
}

#[derive(Serialize, Deserialize, Debug)]
struct Register {
    email: String,
    firstname: String,
    lastname: String,
    street: String,
    house_number: i32,
    postal_code: i32,
    login_name: String,
    password: String
}

#[derive(Serialize, Deserialize, Debug)]
struct Login {
    login_name: String,
    password: String
}