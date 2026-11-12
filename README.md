# ROOF — Esperienza 3D

Proposta indipendente di redesign per **ROOF Videodesign**, studio di Bologna specializzato in contenuti video, live visuals e ambienti 3D per eventi dal vivo.

In questa versione il sito è una **città in 3D**: il palazzo ROOF si costruisce davanti all'utente, ogni finestra è una pagina o un progetto con il suo video, e la navigazione è un volo di camera da una finestra all'altra. Il sito è statico: nessun server, nessuna build, nessuna installazione.

---

## Indice

1. [Avvio rapido](#avvio-rapido)
2. [Come funziona il sito](#come-funziona-il-sito)
3. [Le pagine](#le-pagine)
4. [Caricamento dei video](#caricamento-dei-video)
5. [Esperienza mobile](#esperienza-mobile)
6. [Lingua italiano / inglese](#lingua-italiano--inglese)
7. [Accessibilità e compatibilità](#accessibilità-e-compatibilità)
8. [Struttura dei file](#struttura-dei-file)
9. [Note tecniche](#note-tecniche)
10. [Librerie](#librerie)
11. [Cronologia delle versioni](#cronologia-delle-versioni)
12. [Requisiti e note](#requisiti-e-note)

---

## Avvio rapido

1. Scarica o estrai l'intera cartella del progetto.
2. Apri `index.html` con un doppio clic (Chrome, Edge, Safari o Firefox recenti).

Non servono Live Server, Node.js o altre installazioni.

> **Importante:** mantieni la struttura delle cartelle così com'è. `index.html` deve restare accanto ai file `.js` e `.css` e alle cartelle `assets`, `vendor` e `media`.

---

## Come funziona il sito

### 1. Loader

Il logo ROOF e una barra di avanzamento accompagnano i primi istanti.

- Il video della finestra iniziale (il logo ROOF in home) inizia a scaricarsi dalla prima riga della pagina.
- Il loader si apre quando almeno **un terzo** dei video delle finestre è pronto a partire, mai prima di 1,1 secondi e **mai dopo 3 secondi**.
- La barra avanza sempre in modo fluido, senza scatti né passi indietro.

### 2. Il volo d'apertura

Dopo il loader la città si costruisce in 3D, le finestre del palazzo si accendono e la camera vola verso il palazzo ROOF fino a fermarsi davanti alla finestra della pagina aperta, che riempie tutto lo schermo. Il pulsante **Skip intro**, in basso a destra, accelera il volo.

### 3. La home: un percorso dentro il palazzo

Scorrendo la home la camera si muove dentro e attorno al palazzo:

1. **Finestra del logo ROOF:** la schermata iniziale.
2. **Ingresso nella stanza:** la finestra si apre, appare **We love what we do** e poi **The Studio**.
3. **Lo schermo dei lavori:** un prisma a cinque facce ruota mostrando i 5 progetti selezionati, ciascuno con categoria, titolo, descrizione e pulsante **Explore project**.
4. **Uscita sul lato del palazzo:** le card dei progetti scorrono in 3D.
5. **Salita fino al tetto:** i servizi principali e, in fondo, l'insegna ROOF con l'antenna, il footer e **Take me back to the top**.

Dietro ogni blocco di testo un velo scuro leggero ne garantisce la leggibilità.

### 4. Cambio pagina

Cambiando pagina la camera esce dalla finestra attuale, percorre la facciata del palazzo ed entra nella finestra della nuova pagina. Lo stesso vale per ogni singolo progetto, ognuno con la propria finestra. Una scritta in basso indica la pagina in cui si sta entrando e il piano del palazzo.

### 5. Refresh a metà pagina

Se ricarichi la pagina mentre sei a metà, il sito ripete l'animazione d'apertura e poi scorre da solo fino al punto esatto in cui eri.

### 6. Take me back to the top

In fondo alla home, il pulsante riporta all'inizio con una risalita di circa 3,6 secondi. La camera scorre in modo continuo tra le sezioni, come se qualcuno stesse scorrendo il sito.

---

## Le pagine

| Pagina | Indirizzo | Contenuto |
|---|---|---|
| **Home** | `#/` | Il percorso dentro il palazzo descritto sopra |
| **What we create** | `#/works` | Archivio dei 9 progetti con filtri per categoria |
| **Services** | `#/services` | Elenco dei servizi a fisarmonica, ognuno con descrizione, video e link al progetto collegato |
| **About** | `#/about` | Presentazione dello studio e loghi di clienti e collaboratori |
| **Let's talk** | `#/contacts` | Email, indirizzo con link alla mappa, descrizione e video |
| **Progetto** | `#/project/<nome>` | Note di progetto, crediti, galleria di immagini, video aggiuntivi, link a YouTube, progetto successivo |

### Foto ingrandite

Nella galleria di un progetto, una foto cliccata cresce dalla sua miniatura fino a una cornice arrotondata su fondo scuro, con il nome del progetto e il numero dell'immagine. Si chiude con il pulsante circolare, cliccando sul fondo o con `Esc`, e rientra nella miniatura senza scatti.

### Video su YouTube

Il riquadro sotto i video di un progetto apre il video originale direttamente su YouTube, in una nuova scheda.

---

## Caricamento dei video

Un unico gestore decide quali video scaricare e in che ordine, così la banda va sempre a ciò che serve in quel momento:

1. **Loader e volo d'apertura:** solo i video del palazzo. Per primo e da solo quello della finestra di partenza (ROOF in home), poi gli altri a partire dai più vicini.
2. **Quando circa due terzi del palazzo sono pronti:** si aggiungono i video della home.
3. **Appena si entra in una pagina:** i download non finiti del palazzo vengono messi in pausa. Prima si scarica, da solo, il video della finestra della pagina, poi tutti i video della pagina vengono resi *pronti a partire*, nell'ordine in cui compaiono.
4. **Poi:** riprende il palazzo e, alla fine, gli altri video del sito.

Ad ogni cambio pagina si riparte dal punto 3.

**Accorgimenti aggiuntivi**
- Un video che si sta guardando non viene mai interrotto.
- Due video che sono lo stesso file (lo sfondo e la copia sotto il testo in Let's talk) non vengono mai scaricati in parallelo: la copia arriva dalla cache.
- I telefoni non scaricano i video nascosti. Mentre un video si prepara e la sua finestra non è ancora inquadrata, viene tenuto in un punto minuscolo e invisibile; appena la finestra entra in vista torna al suo posto, già in riproduzione.
- Le immagini di anteprima sono ritagliate e mai deformate, e i video compaiono solo quando sono davvero in movimento.
- Il video "Solana Breakpoint" salta il primo istante, in cui metà schermo è nera.

---

## Esperienza mobile

### Video più leggeri

La cartella `media/m` contiene copie leggere dei **21 video** del sito:

| Tipo di video | Risoluzione |
|---|---|
| Video brevi in loop (finestre, lavori, servizi) | 720p |
| Video lunghi dei progetti | 540p |

In tutto pesano **circa 57 MB invece di 266 MB**, circa 4,7 volte meno da scaricare.

Su telefoni e schermi fino a **900 px** il sito usa automaticamente queste copie, comprese le finestre del palazzo e il download anticipato del video ROOF. Su desktop restano i video originali in Full HD dal sito di ROOF.

### Layout dedicato

- **Finestra iniziale:** riempie lo schermo come su desktop. Durante l'avvicinamento il video ROOF si assesta largo il doppio dello schermo, con il logo intero e un riflesso sfumato sopra e sotto, già fermo quando la camera atterra.
- **Schermo dei lavori:** "Selected work", titolo e descrizione più in basso, con **Explore project** sulla riga della descrizione.
- **Let's talk:** il video della finestra fa da sfondo alla schermata del titolo, e lo stesso video è ripetuto sotto i paragrafi.
- **Footer:** "Let's make something move." resta su una riga con la freccia, e **Take me back to the top** sta sulla riga dei social.
- **Hover:** nessun effetto hover su touch, perché gli hover valgono solo con il mouse.

---

## Lingua italiano / inglese

Il selettore **IT / EN** è nell'header, anche su mobile. La scelta viene ricordata dal browser e la traduzione funziona anche aprendo `index.html` dal disco.

---

## Accessibilità e compatibilità

- **Riduci movimento:** con l'opzione di sistema attiva, l'intro e i voli sono disattivati.
- **Senza WebGL:** se il browser non supporta il 3D, il sito mostra le pagine con il video come sfondo.
- **Prestazioni:** il sito riproduce solo i video delle finestre più visibili e abbassa da solo la risoluzione 3D se il dispositivo rallenta.
- Link "Skip to content", focus visibile e testi alternativi.
- Le foto ingrandite si chiudono con `Esc`.

---

## Struttura dei file

```
.
├── index.html        Struttura della pagina, header, loader, visualizzatore foto, avvio anticipato del video ROOF
├── style.css         Stili, layout responsive e animazioni delle pagine
├── world.js          Città, palazzo, finestre, stanza, tetto e camera (Three.js)
├── app.js            Pagine, navigazione, scroll, transizioni e gestione del caricamento dei video
├── data.js           Contenuti del sito (testi, immagini, video) e logo per l'insegna
├── translations.js   Testi italiani
├── assets/           Logo ROOF (giallo e nero)
├── vendor/           GSAP, Three.js, Lenis
└── media/
    └── m/            Versioni leggere dei video per mobile
```

---

## Note tecniche

- **I video non sono texture WebGL:** il server di origine non invia le intestazioni CORS necessarie. Sono veri elementi `<video>` posizionati in 3D sotto il canvas e visti attraverso dei "fori" nelle finestre del palazzo.
- La posizione dei video viene sincronizzata con la camera Three.js a ogni fotogramma.
- Lo scroll è gestito da Lenis, che guida sia il percorso della camera sia le animazioni dei contenuti.

---

## Librerie

| Libreria | Versione | Utilizzo |
|---|---|---|
| [Three.js](https://threejs.org/) | r160 | Città, palazzo e camera in 3D |
| [GSAP](https://gsap.com/docs/v3/) | 3.15 | Volo d'apertura, transizioni, foto ingrandite |
| [Lenis](https://github.com/darkroomengineering/lenis) | 1.1.14 | Scroll fluido |

Tutte le librerie sono incluse nella cartella `vendor`.

---

## Cronologia delle versioni

| Versione | Principali novità |
|---|---|
| **v3** | Link diretti a YouTube, home senza elementi di disturbo, velo scuro dietro i testi, nuove foto ingrandite, layout mobile rivisto |
| **v4** | Video ROOF con logo intero e riflesso su mobile, tetto ben visibile, ritorno al punto dopo il refresh |
| **v4.1 – v4.6** | Ingresso diretto nella finestra, video già alla misura finale all'atterraggio, puntatore sotto il mouse, nessuno spostamento dopo l'animazione |
| **v5 – v5.4** | Nessun hover su touch, risalita più fluida, footer senza tinte gialle, video delle finestre caricati da subito, intro più lunga di 1 secondo |
| **v6 – v6.4** | Gestore unico del caricamento dei video con priorità, loader al massimo 3 secondi, video su iPhone caricati anche fuori inquadratura, immagini dei progetti sempre visibili, Services subito scorrevole |
| **v7** | Video leggeri su mobile (`media/m`), originali in Full HD su desktop |

---

## Requisiti e note

- Serve una connessione internet per foto, font e, su desktop, video, che restano collegati al sito originale di ROOF.
- Su mobile i video vengono letti dalla cartella `media/m`: quando il sito verrà pubblicato online, questa cartella va caricata sul server insieme al resto.
- Tutti i contenuti sono di proprietà di RVD srl. Questo progetto è un concept di redesign indipendente.

© RVD srl — Independent redesign concept
