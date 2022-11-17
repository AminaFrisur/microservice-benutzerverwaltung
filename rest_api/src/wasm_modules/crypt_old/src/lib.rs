extern crate bcrypt;
use wasm_bindgen::prelude::*;

use bcrypt::{hash, verify};

#[wasm_bindgen]
pub fn encrypt(plain_text_password: String) -> String {
    let hash = hash(plain_text_password, 10).unwrap();
    return hash;

}

#[wasm_bindgen]
pub fn check_password_hash(plain_password: String, hash: String) -> bool {

    let valid = verify(plain_password, &hash).unwrap();
    return valid;

}
