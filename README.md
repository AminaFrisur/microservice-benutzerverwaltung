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
