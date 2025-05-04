# TFG – Adaptació digital de *La Isla Calavera*

Aquest projecte forma part del **Treball Final de Grau** i consisteix en l'adaptació del joc de taula *La Isla Calavera* a una **versió digital interactiva**, pensada per ser accessible des de qualsevol dispositiu: ordinadors, tauletes i telèfons mòbils.

## 🎯 Objectiu

Recrear l'experiència del joc de taula original en un entorn web mitjançant:

- **HTML5**
- **CSS3**
- **JavaScript**
- **Three.js** i **Cannon.js** per a la simulació visual i física dels daus

L'objectiu és mantenir la jugabilitat i l’essència del joc analògic, amb una interfície moderna i accessible, adaptada a suports digitals.

## 🌐 Accés al projecte

El projecte està allotjat en dues versions accessibles via navegador:

- 🔧 **Versió de desenvolupament (pre-producció):**  
  [https://burxat.dev/TFG-UOC/](https://burxat.dev/TFG-UOC/)

- 🚀 **Versió de producció (estable):**  
  [https://TFG.burxat.dev](https://TFG.burxat.dev)

---

## 💻 Compatibilitat i requisits

Aquest joc està dissenyat per funcionar en **navegadors web moderns** i és compatible amb ordinadors, mòbils, tauletes i Smart TVs.

🔔 **Important:** Si es descarrega el projecte per executar-lo localment, cal tenir en compte que **JavaScript no podrà accedir a determinats fitxers** (com les textures o models dels daus) si es carrega el `index.html` directament amb `file://`.  
Per aquest motiu, **cal exposar els fitxers en un servidor web** (com Apache, Nginx, o una extensió com Live Server de VS Code, pot ser local o al núvol). També funciona amb aplicacions com [PHPDesktop](https://github.com/cztomczak/phpdesktop)

## 🔓 Llicència i reutilització

Aquest projecte està publicat sota una **llicència lliure**. Es pot descarregar, modificar i reutilitzar lliurement, sempre que es mantingui la referència a l’autor original.

Això inclou:
- Fer-ne una adaptació personalitzada
- Allotjar-lo en un domini propi
- Incorporar-lo en projectes educatius o comercials

## 📁 Estructura del projecte

El projecte està format per un fitxer `index.html` principal i diverses carpetes amb:

- Arxius d'àudio (`/audio/`)
- Arzius d'imatge (`/img/`)
- Recursos generals (`/doc/`)

## 🖼️ Captures de pantalla

Vista del joc en diferents dispositius:

### 💻 Ordinador
![Captura PC](https://burxat.dev/TFG-UOC/img/exempleJoc.png)

### 📱 Mòbil
![Captura mòbil](https://burxat.dev/TFG-UOC/img/exempleJocTelf.png)

---

## 🔧 Tecnologies utilitzades

- **HTML5** – Estructura de la pàgina
- **CSS3** – Estils i disseny adaptatiu
- **JavaScript** – Lògica del joc i interaccions
- **Three.js** – Simulació gràfica 3D dels daus
- **Cannon.js** – Física del moviment i col·lisió dels daus
- **localStorage API** – Persistència local de dades

---

## 🚧 Roadmap (en desenvolupament)

- ✅ Interfície responsive HTML/CSS funcional
- ✅ Simulació de daus amb física realista
- ✅ Multiplataforma (PC, mòbil, tauleta, TV)
- ✅ Llançament públic via GitHub i domini personalitzat
- 🔜 Mode multijugador local
- 🔜 Persistència de puntuacions entre sessions
- 🔜 Sons i animacions enriquides
- 🔜 Guia interactiva per a nous jugadors
- 🔜 Traducció a diversos idiomes

---

## 🧑‍💻 Autor

**Joan Marc Guillamon Sanz**  
Treball Final de Grau – Universitat Oberta de Catalunya (UOC)

📬 Contacte: [joanmarcgs@gmail.com](mailto:joanmarcgs@gmail.com)
