# ROOF — Proposta Mix

Proposta indipendente di restyling per **ROOF Videodesign**, studio di Bologna specializzato in contenuti video, live visuals e ambienti 3D per eventi dal vivo.

Questa versione unisce le due proposte precedenti: la struttura semplice e leggibile della **proposta 1** fa da base, mentre dalla **proposta Cinema** arrivano il manifesto "We love what we do", le card che si inclinano seguendo il mouse, la pagina del singolo progetto con il video che "vola" fino alla copertina, la pagina About, la pagina Let's talk e il footer.

Il sito è una single-page application statica: nessun server, nessuna build, nessuna installazione. Tutti i contenuti (testi, progetti, immagini e video) provengono dal sito originale di ROOF e sono incorporati nel codice.

---

## Indice

1. [Cosa viene da ciascuna proposta](#cosa-viene-da-ciascuna-proposta)
1. [Avvio rapido](#avvio-rapido)
2. [Come funziona il sito](#come-funziona-il-sito)
3. [Le pagine](#le-pagine)
4. [Caricamento di video e immagini](#caricamento-di-video-e-immagini)
5. [Esperienza mobile](#esperienza-mobile)
6. [Lingua italiano / inglese](#lingua-italiano--inglese)
7. [Accessibilità](#accessibilità)
8. [Struttura dei file](#struttura-dei-file)
9. [Librerie](#librerie)
10. [Requisiti e note](#requisiti-e-note)

---

## Cosa viene da ciascuna proposta

| Parte del sito | Stile | Dettagli |
|---|---|---|
| Loader e video ROOF iniziale | Proposta 1 | Il video identitario compare a tutto schermo dopo il caricamento |
| Header | Proposta 1 | **Let's talk** senza riquadro: una sola linea sotto il testo che, al passaggio del mouse, si colora di giallo da sinistra verso destra |
| Barra di lettura sotto l'header | Proposta 1 | Linea gialla che avanza con lo scroll |
| "We love what we do." | Cinema | Manifesto centrato a tutto schermo, con *what we do.* in corsivo giallo |
| Vetrina dei lavori in home | Proposta 1 | Sezione fissata con i 5 lavori selezionati |
| Card dei progetti in home | Proposta 1 + Cinema | Layout della proposta 1, con inclinazione e riflesso che seguono il mouse |
| Link testuali (Meet ROOF, All projects…) | Mix | Al passaggio del mouse la freccia diventa gialla e la linea sotto si riempie di giallo da sinistra |
| What we create | Proposta 1 + Cinema | Titolo e filtri della proposta 1, separati da una linea; card Cinema con video, inclinazione, numero giallo e freccia che ruota verso destra |
| Services | Proposta 1 | Fisarmonica con video |
| Pagina di un progetto | Cinema | Copertina divisa, note e crediti, galleria, link YouTube arrotondato, banda gialla "Next project", pulsante **← All projects** della proposta 1 |
| About | Cinema | Senza "Beyond the screen" (già presente in home); loghi in cornice come nella proposta 3D; linea sopra e sotto la fascia scorrevole |
| Let's talk | Cinema | **Find us on the map** come link della proposta 1: freccia che diventa gialla e ruota, linea che si riempie |
| Footer | Cinema su giallo | La freccia sta accanto a "something move." e, al passaggio del mouse, scorre fluida verso destra |

In tutto il sito non c'è alcun effetto vetro (sfocatura dello sfondo).

### Numerazione dei lavori

Il numero giallo di ogni card in **What we create** indica la posizione nella lista visibile: con il filtro *All projects* Be You è il numero 05, con il filtro *3D & animation* diventa 01.

### Apertura di un progetto

Cliccando una card (in home, in What we create o il pulsante **Explore project** della vetrina), il video si stacca dalla card, il fondo si scurisce e il video vola fino alla copertina del progetto continuando a girare, senza ripartire. I testi della pagina entrano dopo l'atterraggio.

---

## Avvio rapido

1. Scarica o estrai l'intera cartella del progetto.
2. Apri `index.html` con un doppio clic (Chrome, Edge, Safari o Firefox recenti).

Non servono Live Server, Node.js o altre installazioni.

> **Importante:** mantieni la struttura delle cartelle così com'è. `index.html` deve restare accanto a `style.css`, ai file `.js` e alle cartelle `assets`, `vendor` e `media`.

---

## Come funziona il sito

### 1. Schermata di caricamento

All'apertura compare il logo ROOF con una barra di avanzamento. La schermata attende il primo fotogramma del video principale della home, così il sito si apre già in movimento, mai su uno schermo nero.

Se la rete è lenta o il video non risponde, dopo **8 secondi** il sito si apre comunque. All'uscita il logo si dissolve e la pagina entra con un'animazione di apertura.

### 2. Navigazione

Il sito è una single-page application: ogni pagina ha un indirizzo proprio dopo il simbolo `#`, per esempio `#/works`, `#/about` o `#/project/salmo`. Le pagine si possono quindi condividere, aggiungere ai preferiti e navigare con i tasti avanti e indietro del browser.

L'header resta sempre disponibile. Su mobile il menu si apre con il pulsante **Menu +**.

### 3. Cambio pagina

Il cambio di pagina avviene senza loader:

- la pagina attuale si dissolve lentamente;
- nel frattempo i video della prima schermata della pagina successiva iniziano già a scaricarsi, uno dopo l'altro e con il primo in precedenza;
- la nuova pagina compare con i video pronti e già in riproduzione.

### 4. Animazioni allo scroll

Titoli, card e blocchi di testo entrano con un leggero movimento quando arrivano nello schermo. In alto una sottile barra gialla indica l'avanzamento della lettura. Su desktop le immagini delle card hanno un leggero effetto parallasse.

---

## Le pagine

| Pagina | Indirizzo | Contenuto |
|---|---|---|
| **Home** | `#/` | Video identitario ROOF a tutto schermo, manifesto "We love what we do", vetrina dei 5 lavori selezionati, presentazione dello studio, "Beyond the screen" con le card dei progetti, servizi principali |
| **What we create** | `#/works` | Archivio dei 9 progetti con filtri per categoria (Live visuals, 3D & animation, Interactive, XR & virtual) |
| **Services** | `#/services` | Elenco dei servizi a fisarmonica, ognuno con descrizione, video e link al progetto collegato |
| **About** | `#/about` | Presentazione dello studio con il video ROOF, manifesto su fondo giallo, fascia scorrevole e loghi di clienti e collaboratori |
| **Let's talk** | `#/contacts` | Scheda con video, email, indirizzo con link alla mappa e descrizione dello studio |
| **Progetto** | `#/project/<nome>` | Pagina dedicata a ogni lavoro |

### Home: la vetrina dei lavori

Scorrendo la home si entra in una sezione "fissata" allo schermo. Ogni porzione di scroll mostra uno dei 5 lavori selezionati: video a tutto schermo, categoria, titolo, breve descrizione e pulsante **Explore project**.

La timeline in basso indica il lavoro corrente e l'avanzamento, e permette di saltare direttamente a un lavoro.

### Pagina di un progetto

Ogni progetto contiene:

- copertina divisa in due: video a sinistra, nome, categoria e pulsante **← All projects** a destra;
- note di progetto e crediti;
- galleria di immagini;
- eventuali video aggiuntivi;
- link al video originale su YouTube, che si apre in una nuova scheda;
- banda gialla con il collegamento al progetto successivo.

### Foto ingrandite

Nella galleria di un progetto, cliccando su una foto:

- la foto cresce dalla sua miniatura fino a una cornice arrotondata al centro dello schermo, su fondo scuro;
- in basso compaiono il nome del progetto e il numero dell'immagine (es. `02 / 04`);
- mentre è aperta viene caricata una versione più nitida;
- si chiude con il pulsante rotondo, cliccando sul fondo o premendo `Esc`, e rientra nella miniatura senza scatti.

---

## Caricamento di video e immagini

Il sito è ottimizzato per mostrare i contenuti il prima possibile, soprattutto su connessioni mobili.

**Immagini**
- Le foto vengono servite ridimensionate e in formato WebP tramite il CDN di WordPress (`i0.wp.com`), con un peso pari a circa la metà dell'originale.
- Se il CDN non risponde, viene caricata automaticamente l'immagine originale.
- Le immagini compaiono con una dissolvenza solo quando sono state scaricate per intero, così non si caricano mai "a pezzi" dall'alto verso il basso.

**Video**
- I video fuori schermo iniziano a scaricarsi poco prima di entrare in vista, così sono già in movimento quando compaiono.
- Un video resta invisibile, lasciando vedere l'immagine di anteprima o lo sfondo, finché non è davvero in riproduzione: nessun fotogramma nero o bloccato.
- Nella pagina About il video ROOF ha la precedenza: il secondo video inizia a caricarsi solo quando il ROOF è pronto a partire.
- I controlli nativi del browser (play, pausa, volume) non vengono mai mostrati.

---

## Esperienza mobile

### Video più leggeri

La cartella `media/m` contiene copie leggere dei **21 video** del sito:

| Tipo di video | Risoluzione |
|---|---|
| Video brevi in loop (home, lavori, servizi, About) | 720p |
| Video lunghi dei progetti | 540p |

In tutto pesano **circa 57 MB invece di 266 MB**: circa 4,7 volte meno da scaricare.

Su telefoni e schermi fino a **900 px** il sito usa automaticamente queste copie. Su desktop restano i video originali in Full HD dal sito di ROOF. La scelta è automatica e non richiede nulla all'utente.

### Layout

Su mobile:
- il video principale occupa tutto lo schermo;
- la vetrina dei lavori riempie l'intera altezza;
- didascalie e pulsanti sono ridisposti per lo schermo verticale;
- l'indirizzo e il link alla mappa restano sulla stessa riga.

---

## Lingua italiano / inglese

Il selettore **IT / EN** è sempre disponibile nell'header, anche su mobile.

- La lingua iniziale è l'inglese; la scelta viene ricordata dal browser.
- La traduzione è locale e funziona anche aprendo `index.html` dal disco, senza servizi esterni.
- Testi, servizi, navigazione e descrizioni sono tradotti.
- Nomi di brand, progetti, tour, crediti professionali e termini tecnici come *live visuals*, *Notch*, *NFT*, *AI* e *game development* restano in inglese.

---

## Accessibilità

- **Riduci movimento:** se nel sistema è attiva l'opzione "riduci animazioni", le animazioni vengono disattivate o semplificate e i contenuti restano accessibili.
- Link "Skip to content" per passare direttamente al contenuto con la tastiera.
- Testi alternativi per immagini e controlli, stati dei pulsanti (`aria-pressed`, `aria-expanded`) e focus visibile.
- Le foto ingrandite si chiudono anche con il tasto `Esc`.

---

## Struttura dei file

```
.
├── index.html           Struttura della pagina, header, footer, schermata di caricamento
├── style.css            Stili di base (proposta 1), layout responsive e animazioni
├── mix.css              Componenti in stile Cinema e regole della proposta Mix (caricato dopo style.css)
├── app.js               Contenuti del sito, pagine, navigazione, video, foto ingrandite, cambio pagina
├── loader.js            Schermata di caricamento iniziale
├── scroll-effects.js    Animazioni allo scroll e barra di lettura
├── accordion.js         Animazione dei servizi a fisarmonica
├── language.js          Selettore e applicazione della lingua
├── translations.js      Dizionario delle traduzioni italiane
├── translations-extra.js  Traduzioni italiane dei testi in stile Cinema
├── assets/              Logo ROOF (giallo e nero)
├── vendor/              Librerie GSAP e ScrollTrigger
└── media/
    └── m/               Versioni leggere dei video per mobile
```

---

## Librerie

| Libreria | Versione | Utilizzo |
|---|---|---|
| [GSAP](https://gsap.com/docs/v3/) | 3.15.0 | Animazioni del caricamento, delle transizioni e delle foto ingrandite |
| [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | 3.15.0 | Animazioni allo scroll, parallasse e barra di lettura |

Entrambe sono incluse nella cartella `vendor`: il sito funziona senza collegarsi a CDN esterni per gli script. Licenza: [GSAP Standard License](https://gsap.com/standard-license/).

---

## Requisiti e note

- Serve una connessione internet per foto, font e, su desktop, video, che restano collegati al sito originale di ROOF.
- Su mobile i video vengono letti dalla cartella `media/m`: quando il sito verrà pubblicato online, questa cartella va caricata sul server insieme al resto.
- Tutti i contenuti sono di proprietà di RVD srl. Questo progetto è un concept di redesign indipendente.

© RVD srl — Independent redesign concept
