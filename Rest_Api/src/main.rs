
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
use postgres::{Client, NoTls};
use rocket_contrib::json::Json;
use serde::{Serialize, Deserialize};
use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use rand::distributions::{Alphanumeric, DistString};

// TODO: GENEREAL:
// TODO: Implement Error Handling
// TODO: Authentifizierung innerhalb der MS Architektur noch festlegen
// TODO: Rust nightly -> Wirklich empfehlenswert fuer production? -> gibt es auch eine Alternative um rocket zu kompelieren ?
// TODO: Datenbank Daten nicht hard coden
// TODO: Sollte irgendwo anders bereitstehen

// TODO: Benutzerverwaltung:
// TODO: Passwort speichern: -> Dort mal bitte schauen ob MagicCrypt ausreichend ist ! -> Generell die Grundlagen zur Passwort verschlüsselung anschauen !
// TODO: Passwort Reset implementieren -> Dort mal bitte schauen ob MagicCrypt ausreichend ist ! -> Generell die Grundlagen zur Passwort verschlüsselung anschauen !
// TODO: rocket toml Datie anlegen um port auch zu wechseln
// TODO: Change reveiving port for postgres db

// TODO: Create Middleware function that check auth token ! -> in Rocket = Fairings -> WICHTIG: Fairings cannot terminate or respond to an incoming request directly. -> SOMIT MUSS ICH SELBER EINE MIDDLEWARE SCHREIBEN


// middleware function for rocket:
// fn check_auth(req: &mut rocket::Request<'_>)  {
fn check_auth(auth_token: String) -> bool {
    let mut client = Client::connect("host=database port=5432 user=postgres password=test", NoTls).unwrap();
    // let token = req.headers().get_one("token");

    let query_result = client.query("SELECT * FROM users WHERE auth_token = $1 and 10000000 > (SELECT EXTRACT(EPOCH FROM ((SELECT CURRENT_TIMESTAMP::timestamp) - auth_token_timestamp::timestamp)));",
                                    &[&auth_token]).unwrap();
    let vec_user = create_users_list(query_result);
    if vec_user.len() == 1 {
        return true
    } else {
        return false
    }
}

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

#[post("/login", format = "json", data = "<login_json>")]
fn login(login_json: Json<Login>) -> String {
    let login: Login = login_json.into_inner();
    let mut client = Client::connect("host=database port=5432 user=postgres password=test", NoTls).unwrap();
    // Key for encryption
    let mc = new_magic_crypt!("Y2ps3f6ZoTbpZo8ZtUGYLGEjwLDQ2839zu45rfue3wrhi87123", 256);
    let encrypted_password = String::from(mc.encrypt_str_to_base64(login.password));
    let query_result = client.query("SELECT * FROM users WHERE login_name = $1 AND password = $2", &[&login.login_name, &encrypted_password]).unwrap();
    if query_result.len() == 0{
        //Login failed
        return format!("ERROR: Login failed.");
    } else {
        // Login success
        // create and return auth token
        let auth_token = Alphanumeric.sample_string(&mut rand::thread_rng(), 32);
        let vec_user = create_users_list(query_result);
        let id = vec_user[0].id;

        client.execute("UPDATE users SET auth_token = $1, auth_token_timestamp = (SELECT CURRENT_TIMESTAMP) WHERE id = $2",
                       &[&auth_token, &id]).unwrap();
        return format!("{}", auth_token);
    }
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
    // Key for encryption
    let mc = new_magic_crypt!("Y2ps3f6ZoTbpZo8ZtUGYLGEjwLDQ2839zu45rfue3wrhi87123", 256);
    let encrypted_password = String::from(mc.encrypt_str_to_base64(register.password));

    let mut client = Client::connect("host=database port=5432 user=postgres password=test", NoTls).unwrap();
    client.execute("INSERT INTO users(email, firstname, lastname, street, house_number, postal_code, login_name, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                   &[&register.email, &register.firstname, &register.lastname, &register.street, &register.house_number, &register.postal_code, &register.login_name, &encrypted_password]).unwrap();
    let query_result = client.query("SELECT id, email, firstname, lastname, street, house_number, postal_code, login_name FROM users ORDER BY id DESC LIMIT 1",
                                    &[]).unwrap();
    return Json(create_users_list(query_result));
}

fn main()  {
    rocket::ignite().mount("/", routes![get_users, register, change_user, login]).launch();
}

#[derive(Serialize, Deserialize, Debug)]
struct Login {
    login_name: String,
    password: String
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