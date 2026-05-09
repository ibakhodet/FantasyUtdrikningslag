# Fantasy Stian sett utdrekningslag

Mobil fantasy-app for utdrikningslaget i Oslo, juli 2026. 7 venner, 4-mannslag pr. dag, kaptein gir ×2, atferdspoeng administreres av Martin.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Firebase** (Auth, Firestore, Hosting) — valgfritt
- **localStorage**-fallback når Firebase ikke er konfigurert (kjører rett ut av boksen for utvikling)

## Kjør lokalt

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # bygger til dist/
```

Uten Firebase-config kjører appen i demo-modus med seed-data og lokal lagring i nettleseren. Hver enhet er da isolert.

## Struktur

```
src/
  App.tsx              tab-routing + auth-gate
  main.tsx             entry point
  types.ts             TypeScript-typer
  data/
    players.ts         Stian + 6 spillere (eirik, erik, erlend, martin, sondre, thom)
    days.ts            fre, lør, søn med datoer + frister
    rules.ts           hele poenglista, inkl. gruppeutfordringer
    program.ts         itinerary
  lib/
    firebase.ts        Firebase init (kun hvis env satt)
    store.ts           data-lag (Firestore eller localStorage)
    locking.ts         frist-logikk + admin-overstyring
  components/
    Avatar.tsx
    TabBar.tsx
    ui.tsx             Eyebrow, H1, DayTabs, formattering
  screens/
    SplashScreen.tsx   logo + login (player picker)
    TeamScreen.tsx     velg dagens 4-mannslag + kaptein
    TabellScreen.tsx   live podium + leaderboard + feed
    ProgramScreen.tsx  itinerary
    ReglerScreen.tsx   regelbok kategorisert
    AdminScreen.tsx    Martin-only m/PIN, 4 tabs (Poeng, Gruppe, Events, Frister)
    ProfilScreen.tsx   din egen score
public/avatars/        7 avatarer (placeholders)
```

## Spilleregler i koden

- **Admin = Martin.** Kun `martin` ser Admin-fanen. PIN-gate på 4 sifre — sett `VITE_ADMIN_PIN` (default `1234`).
- **Gruppeutfordringer** (`group: true` i `rules.ts`): når Martin trykker en sånn regel, deles poenget ut til alle 6 spillerne. Stian scorer ikke selv.
- **Profil** = innlogget spiller. Logg ut og logg inn som en annen for å se hennes profil.
- **Frister** låser hver dag automatisk basert på 2026-datoer. I Admin → Frister kan Martin tvinge en dag åpen/låst for testing.

---

## Firebase-oppsett — steg for steg

> Du har ikke gjort dette før. Følg trinnene under i rekkefølge. Alt er gratis på Spark-planen for vårt bruk.

### 1. Lag prosjekt

1. Gå til https://console.firebase.google.com og logg inn med Google-kontoen din.
2. Trykk **"Add project"** (Legg til prosjekt).
3. Navn: `fantasy-stian` (eller hva du vil). Trykk **Continue**.
4. Slå av Google Analytics (vi trenger det ikke). Trykk **Create project**.
5. Vent ~30 sek til prosjektet er klart.

### 2. Skaff Firebase-konfig (env-variabler)

1. På prosjekt-dashbordet: trykk på `</>`-ikonet (Web app).
2. Kallenavn: `fantasy-stian-web`. **IKKE** kryss av "Firebase Hosting" ennå. Trykk **Register app**.
3. Du får nå et kodeblokk-eksempel som inneholder noe slik:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "fantasy-stian.firebaseapp.com",
     projectId: "fantasy-stian",
     storageBucket: "fantasy-stian.appspot.com",
     messagingSenderId: "1234...",
     appId: "1:1234...:web:abcd"
   };
   ```
4. Kopier ut hver verdi og lagre i `.env.local` i rota av repoet (lag fila):
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=fantasy-stian.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=fantasy-stian
   VITE_FIREBASE_STORAGE_BUCKET=fantasy-stian.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234...
   VITE_FIREBASE_APP_ID=1:1234...:web:abcd
   VITE_ADMIN_PIN=1337
   ```
   `.env.local` er i `.gitignore`, så hemmelighetene committes ikke.

### 3. Skru på Firestore

1. Sidemeny → **Build → Firestore Database**.
2. **Create database** → **Start in production mode** → Region **eur3 (europe-west)** → **Enable**.

### 4. Last opp sikkerhetsregler

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # velg prosjektet ditt
firebase deploy --only firestore:rules
```

Reglene i `firestore.rules` er midlertidig åpne. Stram inn når ekte Auth er på plass.

### 5. (Valgfritt) Skru på Google Auth

Per nå logger man inn ved å velge spiller fra en liste — funker fint på mobilen og krever ingen Google-kontoer. Vil du ha ekte Google-login:

1. **Build → Authentication → Get started**.
2. Under **Sign-in method**, aktiver **Google**. Sett støtte-e-post.
3. Si fra — så bytter jeg SplashScreen til å bruke `signInWithPopup(auth, new GoogleAuthProvider())` og mappe `email` → `playerId` via en `users`-collection.

### 6. Bygg og deploy til Firebase Hosting

```bash
npm run build
firebase init hosting        # public dir = dist, single-page = Yes, IKKE overskriv index.html
firebase deploy --only hosting
```

Du får en URL som `https://fantasy-stian.web.app` som alle 7 åpner på mobilen.

### 7. Test

1. Åpne URL-en på telefonen (legg til hjemskjerm for "app-følelse").
2. Velg din spiller på splash.
3. Som Martin: gå til Admin, skriv PIN, trykk en regel for å gi en spiller poeng. Alle andre ser oppdateringen i sanntid.

---

## Hva gjenstår

- Reell Google-auth (i stedet for "velg spiller")
- Cloud Function for å videreføre laget automatisk hvis bruker misser frist
- Strammere Firestore-regler (kun admin skriver `events`, kun eier skriver eget `team`)
- Bytte ut placeholder-avatarer med ekte bilder (lastes opp til Firebase Storage)
