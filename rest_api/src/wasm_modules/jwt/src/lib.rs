use hmac::{Hmac, Mac};
use jwt::SignWithKey;
use sha2::Sha256;
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn jwt_sign(login_name: String, private_key: String) -> String {
    let key: Hmac<Sha256> = Hmac::new_from_slice(private_key.as_bytes()).unwrap();
    let mut claims = BTreeMap::new();
    claims.insert("login_name", login_name);

    return claims.sign_with_key(&key).unwrap();
}