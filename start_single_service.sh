#!/bin/bash
docker compose stop -t 1 rest-api-benutzerverwaltung1
docker compose rm rest-api-benutzerverwaltung1
docker compose build rest-api-benutzerverwaltung1
docker compose up --no-start rest-api-benutzerverwaltung1
docker compose start rest-api-benutzerverwaltung1
