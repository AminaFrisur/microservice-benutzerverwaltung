# microservice-benutzerverwaltung
Benutzerverwaltung mit Wasm

Stand 11.10:
- Tokio_postgres funktioniert nicht unter unbekannten umständen
- nicht rekonstruierbar
- somit versuchen postgres mit await zu verbinden

Planänderung:
- Es gibt mehrere Probleme noch mit Rust
- einerseits läuft aus unbekannten Grund Tokio_postgres nicht
- und das Framework Rocket ist extrem umständlich (Beispiel Middleware Funktion, Rückgabe des Responses usw.)
- Deshalb ein neuer Plan: Entwickle erstmal alle MS mit Node.js
- Anschließend versuche ich die non Standalone Referenzarchitektur umzusetzen

Stand 16.11.2022:
- Umsetzung der Extended WASM Architektur
- Versuch 1: bcrypt als wasm modul auslagern
- Dafür die crate bcrypt verwenden -> https://crates.io/crates/bcrypt
- Diese funktioniert ähnlich wie in node.js
- Aktuell funktioniert das nicht so ganz 
- Fehlermeldung ist: [TypeError: WebAssembly.instantiate(): Import #0 module="__wbindgen_placeholder__" error: module is not an object or function]
- Somit Versuch 2: mit wasm-bindgen und wasm-pack
- wasm-pack : "This tool seeks to be a one-stop shop for building and working with rust- generated WebAssembly that you would like to interop with JavaScript,"
- wasm-bindgen: Is a Rust library and CLI tool that facilitate high-level interactions between wasm modules and JavaScript.