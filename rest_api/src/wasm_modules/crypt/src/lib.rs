mod utils;
extern crate bcrypt;
use bcrypt::{hash, verify};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, crypt!");
}


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