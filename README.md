# Gym Planner

Een 3D-webapp om de indeling van de twee gymzalen op de club te ontwerpen.

## Zalen

- **Fitnessruimte** — 6 × 20 m, zwarte vloer, "FITNESSRUIMTE" op de muur
- **Blauwe zaal** — L-vorm van 10 × 10 m + 6 × 5 m, blauwe vloer

De afmetingen en kleuren staan in [js/rooms.js](js/rooms.js), de toestellen in
[js/catalog.js](js/catalog.js). Beide zijn bedoeld om later te verfijnen aan de
hand van foto's van de echte zalen.

## Besturing

| Actie | Bediening |
| --- | --- |
| Lopen | Pijltjestoetsen of WASD (Shift = sneller) |
| Rondkijken | Twee vingers op het touchpad (scrollen) |
| Object selecteren | Muisklik |
| Object verplaatsen | Slepen met de muis (blijft binnen de muren) |
| Object draaien | R (per 45°) |
| Object naar opslag | Delete of Backspace |
| Wisselen van zaal | T of de knop rechts |
| Annuleren / deselecteren | Esc |

Objecten in de **opslag** kun je in de andere zaal (of dezelfde) terugplaatsen
met de knop "Plaats". Via **Nieuw object** voeg je extra toestellen toe. De
knop **Download plattegrond** maakt een PNG met beide zalen op schaal, genummerde
objecten en een legenda. De indeling wordt automatisch bewaard in de browser.

## Lokaal draaien

Geen build-stap nodig. Start een statische webserver in deze map, bijvoorbeeld:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

en open http://localhost:5173/. (Direct openen van index.html vanaf schijf werkt
niet vanwege browserbeveiliging rond ES-modules.)

## Online zetten (GitHub Pages)

1. Maak op github.com een nieuwe repository, bijv. `gym-planner`.
2. Push deze map naar die repository.
3. Ga naar Settings → Pages → Source: "Deploy from a branch", branch `main`, map `/ (root)`.
4. Na een minuut staat de site op `https://<gebruikersnaam>.github.io/gym-planner/`.
