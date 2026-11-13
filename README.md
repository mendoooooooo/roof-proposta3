# ROOF — Proposta finale di redesign

Proposta indipendente di redesign del sito di **ROOF Videodesign**, studio di Bologna che crea contenuti video, live visuals, ambienti 3D ed esperienze interattive per concerti, eventi e brand.

Il sito è una vetrina: presenta lo studio, i lavori e i servizi, e porta il visitatore al contatto. È statico, non richiede server né installazione e si apre con un doppio clic su `index.html`.

---

## Indice

1. [Scopo del progetto](#scopo-del-progetto)
2. [Origine della proposta](#origine-della-proposta)
3. [Avvio rapido](#avvio-rapido)
4. [Pubblicazione online](#pubblicazione-online)
5. [Le pagine](#le-pagine)
6. [Come funziona il sito](#come-funziona-il-sito)
7. [Caricamento di video e immagini](#caricamento-di-video-e-immagini)
8. [Esperienza mobile](#esperienza-mobile)
9. [Lingua italiano / inglese](#lingua-italiano--inglese)
10. [Accessibilità](#accessibilità)
11. [Struttura dei file](#struttura-dei-file)
12. [Architettura del codice](#architettura-del-codice)
13. [Librerie](#librerie)
14. [Compatibilità](#compatibilità)
15. [Requisiti e note](#requisiti-e-note)

---

## Scopo del progetto

Il sito attuale di ROOF comunica lo studio soprattutto attraverso i video. Questa proposta mantiene i contenuti originali (testi, progetti, foto e video) e ne ripensa la presentazione con tre obiettivi:

- **Mettere i lavori al centro.** I video sono sempre in primo piano e si muovono già quando compaiono: niente schermate nere, niente pulsanti play.
- **Una navigazione semplice ma curata.** La struttura resta chiara (Home, lavori, servizi, studio, contatti), arricchita da transizioni fluide che danno continuità tra una pagina e l'altra.
- **Funzionare bene ovunque.** Desktop, telefono in verticale e in orizzontale, connessioni lente. Su mobile il sito usa versioni più leggere dei video.

Il cliente ha chiesto un risultato non troppo complesso: un sito vetrina con il giusto equilibrio tra semplicità ed effetto.

---

## Origine della proposta

Durante il progetto sono state sviluppate tre direzioni:

| Proposta | Idea | Esito |
|---|---|---|
| **Proposta 1** | Sito classico e leggibile, con vetrina dei lavori a scorrimento | Usata come base |
| **Cinema** | Il sito come un film: mosaico d'apertura, pannelli prospettici, video che volano tra le pagine | Componenti ripresi nella proposta finale |
| **3D** | Una città in Three.js in cui ogni finestra è una pagina | Scartata perché troppo complessa per l'obiettivo |

La **proposta finale** unisce le prime due:

| Parte del sito | Stile | Dettagli |
|---|---|---|
| Caricamento e video ROOF iniziale | Proposta 1 | Il video identitario compare a tutto schermo dopo il caricamento |
| Header | Proposta 1 | **Let's talk** senza riquadro: una linea sotto il testo che si colora di giallo da sinistra |
| Linea gialla di lettura | Proposta 1 | Su desktop avanza in alto con lo scroll |
| "We love what we do." | Cinema | Manifesto a tutto schermo con *what we do.* in corsivo giallo |
| Vetrina dei lavori | Proposta 1 | Sezione fissata con i 5 lavori selezionati |
| Card dei progetti | Proposta 1 + Cinema | Layout della proposta 1, con inclinazione e riflesso che seguono il mouse |
| What we create | Proposta 1 + Cinema | Titolo e filtri della proposta 1, card Cinema con video, numero giallo e freccia che ruota |
| Services | Proposta 1 | Fisarmonica con video, una sezione aperta alla volta |
| Pagina di un progetto | Cinema | Copertina divisa, note, crediti, galleria, link YouTube; "Next project" e "All projects" della proposta 1 |
| About | Cinema | Manifesto su fondo giallo, fascia scorrevole, loghi in cornice come nella proposta 3D |
| Let's talk | Cinema | Scheda con video; "Find us on the map" nello stile dei link della proposta 1 |
| Footer | Cinema su fondo giallo | La freccia accanto a "something move." scorre e ruota verso destra al passaggio del mouse |

In tutto il sito non è usato alcun effetto vetro (sfocatura dello sfondo).

---

## Avvio rapido

1. Scarica o estrai l'intera cartella del progetto.
2. Apri `index.html` con un doppio clic in un browser recente (Chrome, Edge, Safari o Firefox).

Non servono Node.js, Live Server o altre installazioni.

> **Importante:** mantieni la struttura delle cartelle così com'è. `index.html` deve restare accanto ai file `.css` e `.js` e alle cartelle `assets`, `vendor` e `media`.

---

## Pubblicazione online

Il sito è composto solo da file statici: basta caricare l'intera cartella su qualsiasi hosting (GitHub Pages, Netlify, un server Apache o Nginx, lo spazio web dello studio).

Con **GitHub Pages**: *Settings → Pages → Branch `main`, cartella `/ (root)` → Save*. Dopo uno o due minuti il sito è raggiungibile all'indirizzo indicato da GitHub, utile anche per provarlo dal telefono.

La cartella `media/m` va sempre pubblicata insieme al resto, perché contiene i video usati su mobile.

---

## Le pagine

| Pagina | Indirizzo | Contenuto |
|---|---|---|
| **Home** | `#/` | Video ROOF, manifesto, vetrina dei 5 lavori selezionati, lo studio, "Beyond the screen" con le card dei progetti, servizi principali |
| **What we create** | `#/works` | Archivio dei 9 progetti con filtri per categoria |
| **Services** | `#/services` | I 7 servizi a fisarmonica, ognuno con descrizione, video e link al progetto collegato |
| **About** | `#/about` | Presentazione dello studio, manifesto, fascia scorrevole, loghi di clienti e collaboratori |
| **Let's talk** | `#/contacts` | Email, indirizzo con link alla mappa, descrizione dello studio e video |
| **Progetto** | `#/project/<nome>` | Copertina, note di progetto, crediti, galleria, video aggiuntivi, link a YouTube, progetto successivo |

### Home

1. **Video ROOF** a tutto schermo, con il pulsante che porta alla vetrina.
2. **We love what we do.**, il manifesto dello studio.
3. **Vetrina dei lavori:** una sezione fissata allo schermo. Scorrendo si passa da un lavoro all'altro (video a tutto schermo, categoria, titolo, descrizione, **Explore project**). La timeline in basso mostra l'avanzamento e permette di saltare a un lavoro.
4. **The studio**, con il link **Meet ROOF**.
5. **Beyond the screen**, con quattro card di progetti.
6. **Ideas into experiences**, con i primi servizi.

### What we create

I filtri (*All projects, Live visuals, 3D & animation, Interactive, XR & virtual*) mostrano solo i lavori della categoria scelta. Il numero giallo di ogni card indica la posizione nella lista visibile: con *All projects* Be You è il numero 05, con *3D & animation* diventa 01.

### Pagina di un progetto

- **Copertina:** video a sinistra; categoria, titolo, didascalia, **← All projects** e il pulsante giallo ↓ a destra. Il pulsante porta alle note ed è allineato alla didascalia.
- **Note e crediti** in una colonna che resta visibile durante la lettura.
- **Galleria:** cliccando una foto, questa cresce dalla miniatura fino a una cornice arrotondata con il nome del progetto e il numero dell'immagine (es. `02 / 04`). Mentre è aperta si carica una versione più nitida. Si chiude con il pulsante rotondo, cliccando sul fondo o con `Esc`, e rientra nella miniatura senza scatti.
- **Video aggiuntivi** e riquadro arrotondato che apre il **video originale su YouTube** in una nuova scheda.
- **Next project** con il pulsante **Explore**.

---

## Come funziona il sito

### Caricamento

All'apertura compaiono il logo ROOF e una barra di avanzamento. Il caricamento attende il primo fotogramma del video ROOF, così il sito si apre già in movimento. Se la rete è lenta, dopo 8 secondi il sito si apre comunque.

### Navigazione

Il sito è una *single-page application*: ogni pagina ha un indirizzo dopo il simbolo `#` (per esempio `#/works` o `#/project/salmo`), quindi si può condividere, salvare nei preferiti e raggiungere con i tasti avanti e indietro del browser.

### Cambio pagina

La pagina attuale si dissolve mentre i video della pagina successiva iniziano già a scaricarsi. La nuova pagina compare con i video pronti e in riproduzione, senza schermate di attesa.

### Apertura di un progetto

- **Da una card** (home o What we create) o da **Explore project** nella vetrina: il video si stacca dalla card, il fondo si scurisce e il video vola fino alla copertina del progetto continuando a girare, senza ripartire. Su desktop, prima del volo, il video si sposta leggermente nella direzione opposta, come una presa di slancio. I testi della pagina entrano dopo l'atterraggio.
- **Da qualsiasi altro link** (Next project, i link di Services): la copertina si apre da un riquadro arrotondato fino a riempire lo spazio, con un leggero zoom del video e i testi che entrano uno dopo l'altro.

### Ritorno al punto

- **Refresh a metà pagina:** il sito si riapre in cima e poi scende da solo, in modo fluido, fino al punto esatto in cui eri.
- **Tasto Indietro o Avanti del browser:** la pagina si apre in cima e scende fino al punto in cui eri prima di cambiarla.
- Un tocco, la rotella o un tasto interrompono subito la discesa.

### Animazioni e interazioni

- Titoli, card e testi entrano con un leggero movimento quando arrivano nello schermo; su desktop le immagini delle card hanno un lieve effetto parallasse.
- Su desktop le card si inclinano e si illuminano seguendo il mouse.
- I link testuali (Meet ROOF, All projects, Find us on the map…) al passaggio del mouse colorano di giallo la freccia e riempiono la linea sotto il testo da sinistra a destra.
- In Services si apre una sezione alla volta: aprendone un'altra, quella precedente si chiude con un'animazione morbida.
- Su desktop la barra di scorrimento del browser è nascosta; l'avanzamento è indicato dalla linea gialla in alto.

---

## Caricamento di video e immagini

Il sito è pensato per mostrare i contenuti il prima possibile, anche su connessioni mobili.

**Video**
- I video iniziano a scaricarsi ben prima di entrare nello schermo, così sono già in movimento quando compaiono.
- Durante il cambio pagina si scaricano in anticipo i primi video della pagina successiva (per esempio il primo lavoro della vetrina e le prime card dell'archivio).
- Un video resta invisibile, lasciando vedere l'immagine di anteprima, finché non è davvero in riproduzione: nessun fotogramma nero o bloccato.
- Se il telefono blocca l'avvio automatico (per esempio in risparmio energetico), i video visibili partono al primo tocco.
- I controlli nativi del browser non vengono mai mostrati.

**Immagini**
- Le foto sono servite ridimensionate e in formato WebP tramite il CDN di WordPress (`i0.wp.com`), con un peso pari a circa la metà dell'originale.
- Se il CDN non risponde, viene caricata automaticamente l'immagine originale.
- Le immagini compaiono con una dissolvenza solo a download completo, mai "a pezzi".

---

## Esperienza mobile

### Video più leggeri

La cartella `media/m` contiene copie leggere dei **21 video** del sito:

| Tipo di video | Risoluzione |
|---|---|
| Video brevi in loop (home, lavori, servizi, About) | 720p |
| Video lunghi dei progetti | 540p |

In tutto pesano **circa 57 MB invece di 266 MB**, circa 4,7 volte meno da scaricare. Su telefoni e schermi fino a 900 px il sito usa automaticamente queste copie; su desktop restano i video originali in Full HD.

### Telefono in verticale

- **Video ROOF:** si vede la fascia del logo intera al centro, con un riflesso sfumato dello stesso video sopra e sotto al posto delle bande nere.
- **Menu a tutto schermo** su fondo scuro: si apre con una dissolvenza e le voci entrano una dopo l'altra. Mentre è aperto la pagina sotto resta ferma, e si chiude con **Close ×** o scegliendo una voce.
- **Indicatore di scorrimento:** al posto della linea gialla in alto, sul bordo destro compare un indicatore giallo arrotondato che segue lo scroll e svanisce quando ci si ferma.
- **Vetrina dei lavori:** il titolo ha una riga propria; didascalia e pulsante **Explore project** stanno sotto, allineati.
- **Next project:** titolo e pulsante sulla stessa riga.
- Nessun effetto hover sui dispositivi touch.

### Telefono in orizzontale

- Il pulsante del menu scompare e le voci si dispongono al centro dell'header, come su desktop.
- I contenuti sono ridimensionati per lo schermo basso: titoli e paragrafi più piccoli, copertine dei progetti complete, archivio su due colonne.
- In Services testo e video stanno affiancati e i video si vedono interi; in Let's talk il video affianca la scheda.

---

## Lingua italiano / inglese

Il selettore **IT / EN** è sempre nell'header.

- La lingua iniziale è l'inglese; la scelta viene ricordata dal browser.
- La traduzione è locale: funziona anche aprendo `index.html` dal disco e non interrompe i video.
- Nomi di brand, progetti, tour, crediti e termini tecnici (*live visuals*, *Notch*, *NFT*…) restano in inglese.

---

## Accessibilità

- **Riduci movimento:** con l'opzione di sistema attiva, animazioni, voli dei video e discese automatiche sono disattivati o semplificati, e i contenuti restano tutti accessibili.
- Link "Skip to content", focus visibile e navigazione da tastiera.
- Testi alternativi per immagini e controlli; stati ARIA dei pulsanti (`aria-pressed`, `aria-expanded`).
- Le foto ingrandite si chiudono anche con il tasto `Esc`.

---

## Struttura dei file

```
.
├── index.html              Struttura della pagina: header, footer, caricamento, visualizzatore foto
├── style.css               Stili di base, layout responsive e animazioni
├── mix.css                 Componenti della proposta finale, mobile e orizzontale (caricato dopo style.css)
├── app.js                  Contenuti, pagine, navigazione, video, cambio pagina, volo dei video, menu
├── loader.js               Schermata di caricamento iniziale
├── scroll-effects.js       Animazioni allo scroll e linea gialla di lettura
├── scroll-restore.js       Ritorno al punto dopo refresh e tasto Indietro
├── accordion.js            Fisarmonica dei servizi (una sezione aperta alla volta)
├── language.js             Selettore e applicazione della lingua
├── translations.js         Dizionario delle traduzioni italiane
├── translations-extra.js   Traduzioni italiane dei testi aggiunti nella proposta finale
├── assets/                 Logo ROOF (giallo e nero)
├── vendor/                 GSAP e ScrollTrigger
└── media/
    └── m/                  Versioni leggere dei video per mobile
```

---

## Architettura del codice

- **Contenuti:** testi, immagini e video delle 4 pagine e dei 9 progetti del sito originale sono raccolti in `app.js`. Le pagine vengono generate da queste informazioni, così aggiornare un testo non richiede di toccare l'HTML.
- **Router:** l'indirizzo dopo `#` decide quale pagina disegnare (`render()`); il cambio pagina (`pageTransition()`) gestisce dissolvenza, precaricamento dei video e animazioni d'ingresso.
- **Video:** ogni video passa da un'unica funzione che sceglie la copia leggera su mobile (`media/m`) o l'originale su desktop. Due osservatori di visibilità avviano il download in anticipo e la riproduzione solo quando il video è sullo schermo.
- **Stili:** `style.css` contiene la base; `mix.css`, caricato dopo, aggiunge i componenti della proposta finale e le regole per mobile e telefono in orizzontale.
- Nessun passaggio di build: i file sono già quelli pubblicati.

---

## Librerie

| Libreria | Versione | Utilizzo |
|---|---|---|
| [GSAP](https://gsap.com/docs/v3/) | 3.15.0 | Transizioni, volo dei video, foto ingrandite, fisarmonica |
| [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | 3.15.0 | Animazioni allo scroll, parallasse, linea di lettura |

Entrambe sono incluse nella cartella `vendor`, quindi il sito non dipende da CDN esterni per gli script. Licenza: [GSAP Standard License](https://gsap.com/standard-license/). I font (Space Grotesk e Inter) sono caricati da Google Fonts.

---

## Compatibilità

- Ultime versioni di Chrome, Edge, Firefox e Safari, su desktop, iOS e Android.
- Alcuni browser possono limitare l'avvio automatico dei video o i download contemporanei; il sito avvia i video al primo tocco quando serve.
- Su iPhone Safari può mostrare brevemente il proprio indicatore di scorrimento accanto a quello giallo del sito.

---

## Requisiti e note

- Serve una connessione internet per foto, font e, su desktop, video, che restano collegati al sito originale di ROOF.
- Su mobile i video vengono letti dalla cartella `media/m`, che va pubblicata insieme al resto.
- Tutti i contenuti (testi, immagini, video e loghi) sono di proprietà di RVD srl. Questo progetto è un concept di redesign indipendente.

© 2026 RVD srl — Independent redesign concept
