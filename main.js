// FUNCIONS I DECLARACIONS globals

	// BUG FIX: Afegim aquestes 4 línies de codi perquè a les smartTV amb navegadors antics es vegi bé el fons de pantalla
	const tvRegex = /SMART[- ]?TV|Tizen|Web0S|WebOS|NETTV|NetCast|LG|Samsung/i;
	if ( tvRegex.test(navigator.userAgent) ) {
		document.body.classList.add('smartTV');
	}
	
	// Definim primer de tot el service worker que ens fa el joc disponible offline
	if ('serviceWorker' in navigator) {
	  // Assegura’t que esperem al load, així el DOM i tots els recursos ja són accessibles
	  window.addEventListener('load', () => {
		navigator.serviceWorker.register('sw.js')
		  .then(reg => console.log('SW registrat amb èxit:', reg))
		  .catch(err => console.error('Error en registrar SW:', err));
	  });
	}
	
	// Funció que ens treu per console l'espai localStorage utilitzat
	function getLocalStorageUsage() {
		let totalChars = 0;
		for (let key in localStorage) {
			if (!localStorage.hasOwnProperty(key)) continue;
			const value = localStorage.getItem(key);
			// comptem caràcters de la clau + valor
			totalChars += key.length + (value ? value.length : 0);
		}
		// cada caràcter en UTF-16 fa 2 bytes
		const totalBytes = totalChars * 2;
		const kb = totalBytes / 1024;
		const mb = kb / 1024;
		console.log(`localStorage aprox. ús:\n▶ ${totalBytes} bytes\n▶ ${kb.toFixed(2)} KB\n▶ ${mb.toFixed(2)} MB`);
	}
	getLocalStorageUsage();
	
	// Creem una classe “StorageVar” que ens permet treballar amb variables localStorage com si fossin variables globals normals
	// Ho fem perquè ens sigui més fàcil mantenir una sèrie de variables persistents entre sessions	
	class StorageVar {
		/**
		* @param {string} key - Clau sota la qual es guarda la variable a localStorage
		* @param {*} defaultValue - Valor per defecte si no existeix res a localStorage
		*/
		constructor(key, defaultValue = null) {
			this.key = key;
			// Si encara no hi ha res guardat i hem passat un default, el guardem
			if (localStorage.getItem(key) === null && defaultValue !== null) {
				localStorage.setItem(key, JSON.stringify(defaultValue));
			}
		}

		/**
		* Getter: retorna el valor actual de la clau a localStorage,
		* parsejat de JSON, i l'embolica en un Proxy si és objecte/array
		*/
		get value() {
			// 1) Obtenim la cadena en brut
			const raw = localStorage.getItem(this.key);
			// 2) Convertim a tipus JavaScript (JSON -> object/array o null)
			const parsed = raw === null ? null : JSON.parse(raw);
			// 3) Si és objecte/array, l'emboliquem en un Proxy que reculli canvis interns
			return this._makeProxy(parsed);
		}

		/**
		* Setter: reb qualsevol valor (primitiva, objecte o array),
		* serialitza a JSON i el guarda a localStorage
		*/
		set value(val) {
			localStorage.setItem(this.key, JSON.stringify(val));
		}

		/**
		* Elimina completament la clau de localStorage
		*/
		clear() {
			localStorage.removeItem(this.key);
		}

		// ---------- Helpers interns per a la creació de proxies ----------

		/**
		* Si obj no és objecte/array o és null, retorna directament
		* Altrament, crea un Proxy per:
		*  - GET: retornar cada propietat també proxyficada (recursiu)
		*  - SET/DELETE: actualitzar la clau de localStorage amb l'estat sencer
		*/
		_makeProxy(obj) {
			// Només proxy per objectes i arrays no-null
			if (typeof obj !== 'object' || obj === null) return obj;

			const self = this; // referència per closures
			return new Proxy(obj, {
				/**
				* Al llegir una propietat, la desemboliquem també si és objecte
				*/
				get(target, prop) {
					return self._makeProxy(target[prop]);
				},
				/**
				* En fer assignació target[prop] = val,
				* primer modifiquem l'objecte local, després re-guardem tot JSON
				*/
				set(target, prop, val) {
					target[prop] = val;
					// re-serialitza i guarda
					self.value = target;
					return true;
				},
				/**
				* Al esborrar una propietat, l'eliminem i reculem l'objecte actualitzat
				*/
				deleteProperty(target, prop) {
					delete target[prop];
					self.value = target;
					return true;
				}
			});
		}
	}

	
	
	
	/*
	============================================================================
	==== Mini tutorial variables localStorage amb el constructor StorageVAr ====
	============================================================================
	
	===== Resum funcionament =====
		Hem generat un constructor anomenat StorageVar. Totes les variables que volem 
		que siguin persistents entre sessions les declararem amb aquest constructor.
		A efectes pràctics, quan treballem amb aquestes variables és com si estiguessim
		treballant amb un objecte que té propietats, en aquest cas l'única que té és "value".
	===== FI Resum funcionament =====
	
	===== Declarar variables =====
		const partidaFinalitzada = new StorageVar('partidaFinalitzada', false); // Tipus Boolean
		const llistaJugadors     = new StorageVar('llistaJugadors', []); // Array d'objectes
		const numTirada          = new StorageVar('numTirada', 0); // Int, string, etc
		const cartaActual        = new StorageVar('cartaActual', null); // Objecte
	===== FI Declarar variables =====
	
	===== Modificar variables =====
		llistaJugadors.value = [{ id:1, nom:'Ana', punts:0 }, { id:2, nom:'Pere', punts:0 }]; // Així reinicialitzariem per complet el valor de llistaJugadors
		llistaJugadors.value[1].punts = 42; // Així modifiquem el valor d'un paràmetre d'un dels objectes de l'array
		llistaJugadors.value.push({ id:3, nom:'Maria', punts:0 }); // Així afegim un registre a una array d'objectes. 
		partidaFinalitzada.value = true;
		numTirada.value++;
		cartaActual.value = cartes[0];
	===== FI Modificar variables =====
	
	===== Llegir variables =====
		// Exemple booleà
		if (partidaFinalitzada.value){ 
			console.log("La partida està marcada com a finalitzada");
		}
		
		// Exemple valor senzill
		console.log(numTirada.value);
		
		//Exemple array sencera
		console.log("Mostrem el llistat de jugadors:", llistaJugadors.value);
		
		//Exemple objecte assignat a partir d'array
		console.log( cartaActual.value.id ); 
		console.log( cartaActual.value.desc ); 
	===== FI Llegir variables =====
	
	===== Eliminar variables =====
	partidaFinalitzada.clear();
	llistaJugadors.clear();
	numTirada.clear();
	

	============================================================================
	== FI Mini tutorial variables localStorage amb el constructor StorageVAr ===
	============================================================================
	*/

	// Declaració de variables localStorage amb el constructor StorageVar
	const partidaIniciada = new StorageVar('partidaIniciada', false); // Variable control per saber si la partida ha estat iniciada
	//const primerTiradaFeta = new StorageVar('primerTiradaFeta', false); // Variable control per saber si estem en la primera tirada d'un torn
	const numTirada = new StorageVar('numTirada', 0); // Variable control per saber en quina tirada estem
	const puntsTornActual = new StorageVar('puntsTornActual', 0); // Variable que guarda els punts de la tirada actual
	const cartaActual = new StorageVar('cartaActual', null); // Variable control per saber quina carta hi ha en joc
	const partidaFinalitzada = new StorageVar('partidaFinalitzada', false); // Variable control per saber si la partida ha finalitzat
	
	// Llista on definim tot el que volem carregar abans d'iniciar el joc (no cal posar-ho tot)
	const arxiusACarregar = [
		// IMG (daus, fons, avatars...)
		'img/fons-platja-pirata.png', 
		'img/pergamiBotoDreta.png',
		'img/pergamiBotoEsquerra.png',
		'img/pergamiBotoMig.png',
		'img/tauler-fusta.webp', 
		'img/dauCompletCompressed.png', 
		'img/dauTiradesBlanc.png', 
		'img/pergami-fons.webp',
		'img/avatar1.png', 
		'img/avatar2.png', 
		'img/avatar3.png',
		'img/avatar4.png', 
		'img/avatar5.png', 
		'img/avatar6.png',
		'img/cartesAnimals.png',
		'img/cartesCalavera1.png',
		'img/cartesCalavera2.png',
		'img/cartesDiamant.png',
		'img/cartesMoneda.png',
		'img/cartesPirata.png',
		'img/cartesTresor.png',
		'img/cartesVaixell2.png',
		'img/cartesVaixell4.png',
		'img/fullscreenButton.png',
		'img/pirateflagButton.png',
		'img/music_on-SFX_off.png',
		'img/spyglassButton.png',
		'img/mostraInstruccionsMico.png',
		'img/instruccionsJoc.png',
		'img/cartellBotoGranEsq.png',
		'img/cartellBotoGranDret.png',
		'img/cartellBotoGranMig.png',
		'img/vaixell-jocv2.png'

		// AUDIO
		//'audio/melodiaPrincipal-corda.mp3',

		// FONTS
		//'doc/piecesofeightFont/PiecesofEight.ttf'
	];

	// Variables globals
	let escenaActiva = "cap"; // Per tenir control de quina escena està activa
	let escenaAnterior = null; // Variable auxiliar que guarda l'escena anterior
	let llistaJugadors = []; // Llista de jugadors amb info, la guardem també en localStorage
	let audioState = 0; // Variable que ens controla l'audio
	let numCalaveres = 0; // Variable que ens controla el num de calaveres que hi ha en joc
	let illaCalaveraMode = false; // VAriable que ens controla si estem en mode illa calavera
	let calaveresIllaAcumulades = 0; // Variable que ens controla les calaveres acumulades en mode illa calavera
	let escenaDausInicialitzada = false;
	
	// Variables globals per els daus
	const daus = [];
	const limitPixels = 50;
	const maxHeight = 8;
	let tiradaEnProgres = false;
	
	// Variables globals per la càmera
	let scene, camera, renderer, world;
	// Posició de la càmera, ho deixem en global
	const posXcam = 0;
	const posYcam = 30;
	const posZcam = 20;
	const lookXcam = 0;
	const lookYcam = -2;
	const lookZcam = 0;
	const fovcam = 30;

	// Funció que fem servir de debug per la càmera
	//setupCameraSliders();
	
	// Constants que ens defineixen el poder tocar els daus amb el ratolí
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

	// Definim les imatges de les cares dels daus
	const caresDauSprite = 'img/dauCompletCompressed.png';
	const caresDauMaterial = []; // Aquí guardem els materials creats des del sprite
	
	const clock = new THREE.Clock(); // Definim constant per arreglar BUG de renderitzat massa ràpid a pantalles amb refresc alt

	// Llista de cartes modificadores de torn
	const cartes = [
		{ id: 'Boti',          img: 'img/cartesTresor.png',      nom: 'Carta: Botí Pirata',          desc: 'Perdre torn per 3 calaveres et permet mantenir els punts', },
		{ id: 'Pirata',        img: 'img/cartesPirata.png',      nom: 'Carta: Pirata de la Sort',    desc: 'Duplica la puntuació final del torn',       },
		{ id: 'Calavera1',     img: 'img/cartesCalavera1.png',   nom: 'Carta: Calavera',             desc: 'Posa una calavera addicional en joc',        },
		{ id: 'Calavera2',     img: 'img/cartesCalavera2.png',   nom: 'Carta: Calaveres',            desc: 'Posa dues calaveres addicionals en joc',     },
		{ id: 'Vaixell2',      img: 'img/cartesVaixell2.png',    nom: 'Carta: Emboscada x2',         desc: 'Has de finalitzar el torn amb 2 vaixells o més per guanyar 500 punts. Si no, en perds 500', },
		{ id: 'Vaixell4',      img: 'img/cartesVaixell4.png',    nom: 'Carta: Emboscada x4',         desc: 'Has de finalitzar el torn amb 4 vaixells o més per guanyar 1000 punts. Si no, en perds 1000',},
		{ id: 'Diamant',       img: 'img/cartesDiamant.png',     nom: 'Carta: Diamant',              desc: 'Posa un diamant addicional en joc',                  },
		{ id: 'Or',            img: 'img/cartesMoneda.png',      nom: 'Carta: Moneda',               desc: 'Posa una moneda addicional en joc',                       },
		{ id: 'Animals',       img: 'img/cartesAnimals.png',     nom: 'Carta: Harmonia Animal',      desc: 'Micos i lloros es tornen compatibles',},
	];
// FI FUNCIONS I DECLARACIONS globals

// Funció que cridem cada cop que volem carregar una escena
function carregaEscena(escena){
			
	// Fem servir una variable auxiliar abans de posar el valor de escenaActiva a escenaAnterior
	const abans = escenaActiva;
	
	const audioBoto = document.getElementById('audio-botoGeneral');
	if (audioBoto) { audioBoto.currentTime = 0; audioBoto.play().catch(() => {}); }
	
	switch(escena){
		case "escena-pantallaInici": // Tornem a pantalla inicial
			actualitzaPantallaInici(); // <--- AFEGEIX AIXÒ!
			canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
		break;
		case "escena-anterior":
			canviaEscena(escenaAnterior); // Funció que amaga l'escena activa i mostra la desitjada
		break;
		case "escena-joc":
			canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
			// Fix per evitar que hi hagi bugs quan reprenem una partida i hi ha un jugador en el torn 0
				if(numTirada.value == 0){ 
					document.getElementById("botoFinalitzarTorn").style.display = "none";
					document.getElementById("puntsTornActiu").textContent = "0 punts";
					desbloquejarTotsElsDaus(); // Per si de cas
				}else{
					document.getElementById("botoFinalitzarTorn").style.display = "flex";
				}
			// FI Fix per evitar que hi hagi bugs quan reprenem una partida i hi ha un jugador en el torn 0
		break;
		default:
			canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
		break;
	}
	 // Ara que ja hem fet tots els canvis, actualitzem finalment escenaAnterior des de la variable auxiliar que hem fet servir
	escenaAnterior = abans;
}

//Funció que cridem quan volem amagar totes les escenes
function amagaEscenes(){
	document.querySelectorAll('.escena').forEach(escena => { // Per cada element amb class 'escena'
		escena.style.display = 'none'; // Li canviem la propietat DOM display a 'none' per amagar-ho
	});
}
			
// Funció que cridem quan volem carregar una escena
function mostraEscena(escena){
	document.getElementById(escena).style.display = 'flex'; // A l'element amb ID variable, li canvies la propietat DOM display a 'flex' per mostrar-ho
}

// Funció que cridem quan volem canviar una escena per una altra
function canviaEscena(escena){
	if (escena === escenaActiva) return; // Ja estem a l'escena
	let novaEscena = document.getElementById(escena);
	// Si ja hi ha una escena activa, fem el fade out
	if (escenaActiva !== "cap") {
		let escenaActual = document.getElementById(escenaActiva);
		escenaActual.style.opacity = '0';
		escenaActual.addEventListener('transitionend', function handler() {
			escenaActual.style.display = 'none';
			escenaActual.removeEventListener('transitionend', handler);
		});
	}
	// Fade in nova escena
	novaEscena.style.display = 'flex';
	novaEscena.style.opacity = '0'; // Assegurem que comença transparent
	setTimeout(() => {
		novaEscena.style.opacity = '1';
	}, 10);
	// Actualitzem l'escena activa
	escenaActiva = escena;
}

// Funció que fem servir a la pantalla de selecció de jugadors. Quan fan clic en un avatar, aquest es posa en color i hi deixa posar un nom
function seleccionarJugador(num) {
	let avatar = document.getElementById("jugadorAvatar" + num);
	let input = document.getElementById("nom" + num);
	
	if (avatar.classList.contains("avatarActivat")) {
		avatar.classList.remove("avatarActivat");
		avatar.classList.add("avatarDesactivat");
		input.disabled = true;
		input.value = "";
	} else {
		avatar.classList.remove("avatarDesactivat");
		avatar.classList.add("avatarActivat");
		input.disabled = false;
		input.focus();
	}
}

// Funcio que actualitza els punts al panell esquerra
function actualitzaPuntuacions() {
	const div = document.getElementById("puntuacionsJugadorsMid");
	if (!div) return;
	div.innerHTML = "<h2>Puntuació</h2><h3>~~~~~~</h3>";
	llistaJugadors.forEach(j => {
		div.innerHTML += "<div style='padding:10px;'>"+j.nom+"<br>"+j.punts+" </div> ";
	});
}

// Funció que es crida cada cop que s'ha d'iniciar una seqüència de torns
function iniciarTorns() {
	if (llistaJugadors.length === 0) return;

	llistaJugadors.forEach((jugador, index) => {
		if (jugador.torn === undefined) {
			jugador.torn = false;
		}
	});

	// Si cap jugador té torn actiu, inicialitzem
	if (!llistaJugadors.some(j => j.torn)) {
		llistaJugadors[0].torn = true;
	}

	localStorage.setItem("llistaJugadors", JSON.stringify(llistaJugadors));
	actualitzaTornsPantalla();
}



function actualitzaTornsPantalla() {
	const jugadorActiu = llistaJugadors.find(j => j.torn);
	if (!jugadorActiu) return;

	// Si la partida està marcada com a finalitzada
	if (partidaFinalitzada.value) {
		document.getElementById("finalitzarTornContainer").style.display = "none";
		document.getElementById("dauTirades").style.display = 'none';
		document.getElementById("cartaEnJoc").style.display = 'none';
		document.getElementById("puntsTornActiu").textContent = "Ha guanyat " + jugadorActiu.nom;
	}else{
		document.getElementById("finalitzarTornContainer").style.display = "flex";
		document.getElementById("dauTirades").style.display = 'block';
		document.getElementById("cartaEnJoc").style.display = 'block';
		document.getElementById("puntsTornActiu").textContent = puntsTornActual.value + " punts";
	}

	document.getElementById("puntsProvisional").style.display = "block";

	// ACTUALITZEM avatar i nom centrat
	const avatarDisplay = document.getElementById("jugadorActiuInfo");
	const avatarImg = document.getElementById("avatarJugadorActiu");
	const nomDisplay = document.getElementById("nomJugadorActiuDisplay");

	avatarImg.src = jugadorActiu.avatar || "img/avatar"+jugadorActiu.poder+".png"; // Valor per defecte
	nomDisplay.textContent = jugadorActiu.nom;

	avatarDisplay.style.display = "block";
	
	robaCarta();
}

// FUnció que cridem cada cop que volem mostrar un missatge en pantalla
function mostrarModalMissatge(text, callback) {
	document.getElementById("textModalMissatge").textContent = text;
	document.getElementById("modalMissatge").style.display = "flex";
	document.getElementById("modalMissatge").dataset.callback = callback ? "true" : "";
}

// Funció que ens tanca el modal de mostrar missatges en pantalla
function tancarModalMissatge() {
	document.getElementById("modalMissatge").style.display = "none";
	if (document.getElementById("modalMissatge").dataset.callback === "true") {
		document.getElementById("modalMissatge").dataset.callback = "";
		if (numCalaveres == 3) {
			finalitzarTorn();
		}
	}
}

// FUnció que mostra i amaga l'ajuda dels punts que fem
function toggleAjudaPunts() {
	const audioBoto = document.getElementById('audio-botoPirata');
	if (audioBoto) { audioBoto.currentTime = 0; audioBoto.play().catch(() => {}); }
	const puntsProv = document.getElementById("resumPuntsTornActiu");
	// llegeix el display computat, no l’inline
	const actual = window.getComputedStyle(puntsProv).getPropertyValue("display");
	puntsProv.style.display = (actual === "none") ? "block" : "none";
}

// Funció per calcular els punts actuals del torn, incloent combinacions especials
function actualitzaPuntsTorn() {
	const cares = [];
	numCalaveres = 0;
	puntsTornActual.value = 0;

	let comptadorMonedes = 0;
	let comptadorDiamants = 0;
	let missatgesResum = [];

	let missatge = '';
	
	// Sumem punts si hi ha diamants o ors
	switch(cartaActual.value.id) {
		case 'Diamant':
			comptadorDiamants++;
			puntsTornActual.value += 100;
			missatge = `💎 Sumes un diamant per carta modificadora!`;
			console.log(missatge);
			missatgesResum.push(missatge);
		break;
		case 'Or':
			comptadorMonedes++;
			puntsTornActual.value += 100;
			missatge = `🪙 Sumes una moneda d'or per carta modificadora!`;
			console.log(missatge);
			missatgesResum.push(missatge);
		break;
	}
	
	for (let { mesh } of daus) {
		const cara = obtenirCaraAmunt(mesh);
		if (cara) cares.push(cara);

		if (cara === 2) {
			puntsTornActual.value += 100;
			comptadorMonedes++;
		}
		if (cara === 4) {
			puntsTornActual.value += 100;
			comptadorDiamants++;
		}
		if (cara === 6) numCalaveres++; // Calavera
	}

	if (comptadorMonedes > 0) {
		missatge = `🪙 ${comptadorMonedes * 100} punts per monedes (${comptadorMonedes})`;
		console.log(missatge);
		missatgesResum.push(missatge);
	}
	if (comptadorDiamants > 0) {
		missatge = `💎 ${comptadorDiamants * 100} punts per diamants (${comptadorDiamants})`;
		console.log(missatge);
		missatgesResum.push(missatge);
	}

	const comptador = {};
	for (let cara of cares) {
		if (cara === 6) continue;
		comptador[cara] = (comptador[cara] || 0) + 1;
	}
	
	// Comptador especial per monedes i diamants
	switch (cartaActual.value.id) {
		case 'Or':
			// la cara “Moneda” de la carta també compta per al combo
			comptador[2] = (comptador[2] || 0) + 1;
		break;
		case 'Diamant':
			// la cara “Diamant” de la carta també compta per al combo
			comptador[4] = (comptador[4] || 0) + 1;
		break;
	}

	let bonusCombinacio = 0;
	let dausUtilitzats = new Set();

	for (let cara in comptador) {
		const num = comptador[cara];
		if (num >= 3) {
			let punts = 0;
			if (num === 3) punts = 100;
			if (num === 4) punts = 200;
			if (num === 5) punts = 500;
			if (num === 6) punts = 1000;
			if (num === 7) punts = 2000;
			if (num === 8) punts = 4000;

			bonusCombinacio += punts;
			const nom = nomCara(cara);
			missatge = `🎲 ${punts} punts per cares iguals (${num}) (${nom})`;
			console.log(missatge);
			missatgesResum.push(missatge);

			for (let i = 0, comptats = 0; i < cares.length && comptats < num; i++) {
				if (cares[i] == cara) {
					dausUtilitzats.add(i);
					comptats++;
				}
			}
		}
	}

	for (let i = 0; i < cares.length; i++) {
		if (cares[i] === 2 || cares[i] === 4) {
			dausUtilitzats.add(i);
		}
	}

	if (dausUtilitzats.size === cares.length) {
		bonusCombinacio += 500;
		missatge = '💎 Tresor perfecte! Bonus extra de +500 punts';
		console.log(missatge);
		missatgesResum.push(missatge);
	}

	// Calculem si l'usuari suma punts per poder de Personatges
	// 1. Troba el jugador actiu i el seu poder
	const jugadorActiu = llistaJugadors.find(j => j.torn);
	if (jugadorActiu) {
		const poder = jugadorActiu.poder;
		let bonusAvatar = 0;
		let msgAvatar;

		switch(poder) {
			case 1:
				// +100 per cada calavera
				bonusAvatar = numCalaveres * 100;
				msgAvatar = `🦴 +${bonusAvatar} punts de poder per calaveres x${numCalaveres}`;
			break;
			case 2: case 4:
				// +100 per cada vaixell
				const numVaixells = (comptador[5] || 0);
				bonusAvatar = numVaixells * 100;
				msgAvatar = `🚢 +${bonusAvatar} punts de poder per vaixells x${numVaixells}`;
			break;
			case 3:
				// +100 per cada mico i lloro
				const numMicos = (comptador[3] || 0);
				const numLloros = (comptador[1] || 0);
				const totalAnimals = numMicos + numLloros;
				bonusAvatar = totalAnimals * 100;
				msgAvatar = `🐒🦜 +${bonusAvatar} punts de poder per animals x${totalAnimals}`;
			break;
			case 5:
				// +100 per cada or (moneda)
				bonusAvatar = comptadorMonedes * 100;
				msgAvatar = `🪙 +${bonusAvatar} punts de poder per or x${comptadorMonedes}`;
			break;
			case 6:
				// +100 per cada diamant
				bonusAvatar = comptadorDiamants * 100;
				msgAvatar = `💎 +${bonusAvatar} punts de poder per diamants x${comptadorDiamants}`;
			break;
		}

		if (bonusAvatar > 0) {
			console.log(msgAvatar);
			missatgesResum.push(msgAvatar);
			puntsTornActual.value += bonusAvatar;
		}
	}
	
	puntsTornActual.value += bonusCombinacio;
	document.getElementById("puntsTornActiu").textContent = puntsTornActual.value + " punts";

	switch(cartaActual.value.id) {
		case 'Pirata':
		// xo₂ al final
			puntsTornActual.value *= 2;
			missatgesResum.push(`☠️ Pirata: puntuació x2 = ${puntsTornActual.value}`);
		break;
		case 'Calavera1':
			// Comptem una calavera extra “gratis”
			numCalaveres = Math.max(0, numCalaveres + 1);
			missatgesResum.push(`☠️ Calavera a la carta: ignoro 1 calavera`);
		break;
		case 'Calavera2':
			numCalaveres = Math.max(0, numCalaveres + 2);
			missatgesResum.push(`☠️ Calavera×2 a la carta: ignoro 2 calaveres`);
		break;
		case 'Vaixell2':
			const v2 = comptador[5] || 0;
			if (v2 >= 2) {
				puntsTornActual.value += 500;
				missatgesResum.push(`🚢×2: +500 punts per ≥2 vaixells`);
			} else {
				puntsTornActual.value -= 500;
				missatgesResum.push(`🚢×2: -500 punts per <2 vaixells`);
			}
		break;
		case 'Vaixell4':
			const v4 = comptador[5] || 0;
			if (v4 >= 4) {
				puntsTornActual.value += 1000;
				missatgesResum.push(`🚢×4: +1000 punts per ≥4 vaixells`);
			} else {
				puntsTornActual.value -= 1000;
				missatgesResum.push(`🚢×4: -1000 punts per <4 vaixells`);
			}
		break;

		case 'Animals':
			// 1) Restem els punts que ja s'hagin posat per separat (micos i lloros)
			function ptsCombo(n) { return [0,0,100,200,500,1000,2000,4000][n]||0; }
			const cntLloro = comptador[1] || 0;
			const cntMico  = comptador[3] || 0;
			let sub = 0;
			if (cntLloro >= 3) sub += ptsCombo(cntLloro);
			if (cntMico  >= 3) sub += ptsCombo(cntMico);
			if (sub) {
				puntsTornActual.value -= sub;
				missatgesResum.push(`🐒🦜 Animals carta: restem ${sub} punts de combos separats`);
			}

			// 2) Sumem el combo únic amb tots dos barrejats
			const totAnimals = cntLloro + cntMico;
			if (totAnimals >= 3) {
				const ptsA = ptsCombo(totAnimals);
				puntsTornActual.value += ptsA;
				missatgesResum.push(`🐒🦜 Animals carta: +${ptsA} punts per ${totAnimals} cares iguals`);
			}
		break;
	}

	document.getElementById("puntsTornActiu").textContent = puntsTornActual.value + " punts";

	// Mostrem el resum al span
	document.getElementById("resumPuntsTornActiu").innerHTML = missatgesResum.join('   ');
	
	
	if (numCalaveres == 3) {
		let penal = 0;
		if (cartaActual.value.id === "Vaixell2") penal = 500;
		if (cartaActual.value.id === "Vaixell4") penal = 1000;

		if (cartaActual.value.id === "Boti") {
			// el Botí ja manté punts normals: no tocar
			mostrarModalMissatge(
				`☠️ Has tret 3 calaveres! Perds el torn! Gràcies a la carta de Botí t'endús ${puntsTornActual.value} punts!`,
				true
			);
		} else {
			// si és carta de vaixell, assignem un valor negatiu a puntsTornActual
			puntsTornActual.value = -penal;
			let miss = `☠️ Has tret 3 calaveres! Perds el torn!`;
			if (penal > 0) miss += ` A més perds ${penal} punts per la carta de ${cartaActual.value.id}.`;
			mostrarModalMissatge(miss, true);
		}
		document.getElementById("resumPuntsTornActiu").textContent = "";
		return;
	}


	if (numCalaveres > 3 && !illaCalaveraMode) {
		// Entrem en “Illa Calavera”
		illaCalaveraMode = true;
		const fisics = daus.filter(d => obtenirCaraAmunt(d.mesh) === 6).length;
		calaveresIllaAcumulades = fisics + extraCalaveresCarta();

		// Mostrem missatge i sortim
		const text = `☠️ Illa Calavera activada! Acumula calaveres per restar punts als rivals!`;
		mostrarModalMissatge(text, false);
		document.getElementById("puntsTornActiu").textContent = "+" + calaveresIllaAcumulades*100 + " punts. -" + calaveresIllaAcumulades*200 + " punts";
		document.getElementById("resumPuntsTornActiu").textContent =
		  `☠️ Illa Calavera: ${calaveresIllaAcumulades} calaveres`;

		return;
	}

	if(numTirada.value == 0){
		document.getElementById("finalitzarTornContainer").style.display = "none";
		document.getElementById("puntsTornActiu").textContent = "";
	}
	
}

// Funció que cridem si volem tenir en compte les calaveres de les cartes que afegeixen calaveres
function extraCalaveresCarta() {
	const id = cartaActual.value.id;
	if (id === 'Calavera1') return 1;
	if (id === 'Calavera2') return 2;
	return 0;
}

// Funció que calcula els punts quan estem a illa calavera
function actualitzaPuntsTornIllaCalavera() {
	// 0) comprova si hi ha calaveres noves; si no, acabem el torn
	const cares = daus.map(d => obtenirCaraAmunt(d.mesh));
	//const total = cares.filter(c => c === 6).length;

	const fisics = cares.filter(c => c === 6).length;
	// ara incloem també les “fantasma” de la carta
	const total = fisics + extraCalaveresCarta();


	const noves = total - calaveresIllaAcumulades;
	if (noves <= 0) {
		console.log("🔚 Illa Calavera: no hi ha calaveres noves, finalitzant torn");
		mostrarModalMissatge("☠️ No has tret cap calavera nova en aquest torn! Marxem d'Illa Calavera!", true);
		finalitzarTorn();
		return;
	}

	// 1) si sí que n’hi ha, acumula-les com abans...
	calaveresIllaAcumulades = total;
	const ptsSelf = noves * 100;
	const penal = noves * 200;

	puntsTornActual.value += ptsSelf;

	// 2) actualitza la UI
	//document.getElementById("puntsTornActiu").textContent = puntsTornActual.value;
	document.getElementById("puntsTornActiu").textContent = "+" + calaveresIllaAcumulades*100 + " punts. -" + calaveresIllaAcumulades*200 + " punts";
	document.getElementById("resumPuntsTornActiu").innerHTML =
	`☠️ Illa Calavera x${calaveresIllaAcumulades}: +${ptsSelf} (rivals -${penal})`;
}

// Definim les cares dels daus
function nomCara(cara) {
	switch (Number(cara)) {
		case 1: return "Lloro";
		case 2: return "Moneda";
		case 3: return "Mico";
		case 4: return "Diamant";
		case 5: return "Vaixell";
		case 6: return "Calavera";
		default: return "Desconeguda";
	}
}

// Funció que cridem quan hem de finalitzar un torn
function finalitzarTorn() {

	const entrantEnIlla = !!illaCalaveraMode;
	const skulls = calaveresIllaAcumulades;

	// 1) si estàvem en mode Illa Calavera, ara sí que apliquem guany i penalització
	if (entrantEnIlla) {
		// +100 per calavera al jugador actiu
		puntsTornActual.value = skulls * 100;
		// -200 per calavera a cada rival
		const penal = skulls * 200;
		llistaJugadors.forEach(j => {
			if (!j.torn) j.punts -= penal;
		});
		// (opcional) missatge resum
		mostrarModalMissatge(
			`🔚 Torn Illa Calavera acabat!  
			Guanyes ${skulls * 100} punts, rivals -${penal} punts.`,
			false
		);
	}

	// sortir del mode Illa
	illaCalaveraMode = false;
	calaveresIllaAcumulades = 0;

	const jugadorActiuIndex = llistaJugadors.findIndex(j => j.torn);
	if (jugadorActiuIndex === -1) return;

	const jugadorActiu = llistaJugadors[jugadorActiuIndex];
	jugadorActiu.punts += puntsTornActual.value;
	// Si volguessim fer que mai hi hagi puntuacions negatives
	//jugadorActiu.punts = Math.max(0, jugadorActiu.punts);

	console.log(`🏆 ${jugadorActiu.nom} guanya ${puntsTornActual.value} punts. Total: ${jugadorActiu.punts}`);


	// Aquí comprovem si ha arribat a 10000 punts
	if (jugadorActiu.punts >= 10000) {
		mostrarModalMissatge(`🎉 Enhorabona ${jugadorActiu.nom}! Has arribat a 10000 punts i guanyes la partida!`, false);
		partidaFinalitzada.value = true;
		document.getElementById("dauTirades").style.display = 'none';
		document.getElementById("finalitzarTornContainer").style.display = 'none';
		document.getElementById("puntsTornActiu").textContent = "Ha guanyat " + jugadorActiu.nom;
		return;  // sortim de la funció per no passar torn
	}

	// Com a Easter Egg, es pot guanyar perdent molt fort. Aquí comprovem si ha arribat a -20000 punts
	if (jugadorActiu.punts <= -10001) {
		mostrarModalMissatge(`🎉 Enhorabona ${jugadorActiu.nom}! Perdre tants punts ha tingut premi! Guanyes la partida!`, false);
		partidaFinalitzada.value = true;
		document.getElementById("puntsTornActiu").textContent = "Ha guanyat " + jugadorActiu.nom + " per loser!";
		document.getElementById("dauTirades").style.display = 'none';
		document.getElementById("finalitzarTornContainer").style.display = 'none';
		return;  // sortim de la funció per no passar torn
	}

	// Passem al següent jugador
	llistaJugadors[jugadorActiuIndex].torn = false;
	const següentIndex = (jugadorActiuIndex + 1) % llistaJugadors.length;
	llistaJugadors[següentIndex].torn = true;

	//localStorage.removeItem('cartaActual');
	cartaActual.clear();
	puntsTornActual.value = 0;
	localStorage.setItem("llistaJugadors", JSON.stringify(llistaJugadors));

	numTirada.value = 0;
	updateFinalitzarTornButton();

	document.getElementById("resumPuntsTornActiu").textContent = "";
		
	actualitzaPuntuacions();
	desbloquejarTotsElsDaus();
	actualitzaTornsPantalla();
}

// Funció que ens mostra o amaga el botó de finalitzar torn (en funció si és primera tirada, etc)
function updateFinalitzarTornButton() {
	const botoFinalitzar = document.getElementById('botoFinalitzarTorn');
	if (numTirada.value === 0 || tiradaEnProgres) {
		botoFinalitzar.style.display = 'none';
	} else {
		botoFinalitzar.style.display = 'flex';
	}
}

// Funció que cridem quan acaba un torn i desbloquegem tots els daus
function desbloquejarTotsElsDaus() {
	for (let dau of daus) {
		dau.body.type = CANNON.Body.DYNAMIC;
		dau.body.mass = 500;
		dau.body.updateMassProperties();
		dau.bloquejatCalavera = false;
		if (dau.mesh && dau.mesh.material) {
			dau.mesh.material.forEach(m => {
				m.opacity = 1;
				m.transparent = false;
				m.color.setHex(0xffffff);  // o el color que fossin abans
			});
		}
	}
}

// FUnció que ens carrega imatges perquè el joc sigui més fluit
function preCarregaTextures(callback) {
	const loader = new THREE.TextureLoader();
	loader.load(caresDauSprite, function (fullTexture) {
		for (let i = 0; i < 6; i++) {
			// Clonem la textura perquè cada cara pugui tenir el seu offset
			const subTexture = fullTexture.clone();
			subTexture.repeat.set(1 / 6, 1);
			subTexture.offset.set(i / 6, 0);
			subTexture.needsUpdate = true;

			const material = new THREE.MeshPhongMaterial({
				map: subTexture,
				shininess: 80
			});
			caresDauMaterial.push(material);
		}
		console.log("✅ Textura sprite carregada i materials creats correctament.");
		callback();
	}, undefined, function (err) {
		console.error("❌ Error carregant la textura del sprite:", caresDauSprite);
	});
}

function initDaus() {
	if (escenaDausInicialitzada) return;
	escenaDausInicialitzada = true;

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(50, 1920/1080, 0.1, 1000);

	camera.fov = fovcam;
	camera.updateProjectionMatrix(); // Actualitza la càmera amb el nou FOV
	camera.position.set(posXcam, posYcam, posZcam);
	camera.lookAt(lookXcam, lookYcam, lookZcam);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(1920, 1080);
	renderer.shadowMap.enabled = true;
	document.getElementById('contenidorDaus').appendChild(renderer.domElement);

	const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambientLight);

	world = new CANNON.World();
	world.gravity.set(0, -200, 0);

	crearTerra();

	for (let i = 0; i < 8; i++) crearDau(i);

	animate();
	renderer.domElement.addEventListener('click', onMouseClick, false); // Iniciem el poder tocar daus
	carregarEstatDaus();
}

function crearTerra() {
	// Creem només el terra físic, invisible al renderitzat
	const terraFisica = new CANNON.Body({
		mass: 0, // És el sòl, no es mou
		shape: new CANNON.Plane(),
		material: new CANNON.Material({ friction: 0.3, restitution: 0.7 }) // Paràmetres de fricció i rebots
	});
	terraFisica.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Pla horitzontal
	world.addBody(terraFisica);
}

function crearDau(index) {
	const fila = Math.floor(index / 4);
	const columna = index % 4;
	//const x = columna * 4.5 - 6.75;
	const x = columna * 4 - 6;
	const z = fila * 2.5 - 1.25;

	const geometria = new THREE.BoxGeometry(1.5, 1.5, 1.5);
	const materials = caresDauMaterial.map(mat => mat.clone());



	const mesh = new THREE.Mesh(geometria, materials);
	mesh.castShadow = true;
	mesh.position.set(x, 5, z);
	scene.add(mesh);

	const shape = new CANNON.Box(new CANNON.Vec3(0.75, 0.75, 0.75));
	const body = new CANNON.Body({
		mass: 500,
		shape: shape,
		position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
		material: new CANNON.Material({ friction: 0.1, restitution: 0.8 })
	});

	body.angularDamping = 0.9;
	body.linearDamping = 0.1;

	world.addBody(body);
	daus.push({ mesh, body, initialPosition: { x: mesh.position.x, z: mesh.position.z } });
}
			
// FUnció que anima els daus
function animate() {
	requestAnimationFrame(animate);
	
	// BUG DETECTAT: al fer servir requestAnimationFrame(animate) i cridar world.step(1/60) sense passar-li el temps real transcorregut, la física “avança” 1/60 s cada vegada que arriba un frame, i a 144 Hz això són 144 calls/s, és a dir 144 × (1/60 s) = 2,4 s de simulació per cada segon real
	//world.step(1 / 60); 
	
	// BUG FIX
	// 1) Definim la mida del pas de temps real (en segons)
	const delta = clock.getDelta();
	// 2) en comptes de world.step(1/60), fem:
	//    - primer argument: timeStep fix (per a la física, 1/60 s)
	//    - segon argument: delta real (en s)
	//    - tercer argument: nombre màxim de substeps (p. ex. 4)
	world.step(1/60, delta, 4);

	for (let { mesh, body, initialPosition } of daus) {
		const deltaX = body.position.x - initialPosition.x;
		const deltaZ = body.position.z - initialPosition.z;

		if (Math.abs(deltaX) > limitPixels / 100) {
			body.position.x = initialPosition.x + Math.sign(deltaX) * limitPixels / 100;
			body.velocity.x = 0;
		}

		if (Math.abs(deltaZ) > limitPixels / 100) {
			body.position.z = initialPosition.z + Math.sign(deltaZ) * limitPixels / 100;
			body.velocity.z = 0;
		}

		if (body.position.y > maxHeight) {
			body.position.y = maxHeight;
			body.velocity.y = 0;
		}

		if (body.velocity.lengthSquared() < 0.01 && body.angularVelocity.lengthSquared() < 0.01) {
			body.velocity.set(0, 0, 0);
			body.angularVelocity.set(0, 0, 0);
		}

		mesh.position.copy(body.position);
		mesh.quaternion.copy(body.quaternion);
	}

	comprovaCaresDaus(); // <----- Mirem les cares dels daus un cop han aturat de moure's

	renderer.render(scene, camera);
	actualitzaPuntuacions();
}

// Funció que s'executa quan tirem els daus
function tirarDaus() {
	// Comptem quants daus queden disponibles (dinàmics i no bloquejats per calavera)
	const disponibles = daus.filter(d =>
		d.body.type !== CANNON.Body.STATIC &&
		!d.bloquejatCalavera
	).length;
	
	if (tiradaEnProgres) {
		console.log("⏳ Tirada en curs. Espera que acabi abans de tornar a tirar.");
		return;
	}
	
	if (disponibles === 0) {
		console.log("⏳ no hi ha daus disponibles per tirar.");
		return;
	}

	// Reproduïm un so o l'altre segons quants quedin
	if (disponibles === 1) {
		const snd1 = document.getElementById('audio-dau');
		if (snd1) { snd1.currentTime = 0; snd1.play().catch(() => {}); }
	} else {
		const snd = document.getElementById('audio-daus');
		if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }
	}
	
	
	tiradaEnProgres = true;
	numTirada.value++;
	updateFinalitzarTornButton();
	
	console.log(`➤ Llançant tirada ${numTirada.value}...`);
	  //localStorage.setItem('numTirada', numTirada);
	  updateFinalitzarTornButton();
  //updateNumTiradaDisplay();

	for (let { body, bloquejatCalavera } of daus) {
		if (body.type !== CANNON.Body.STATIC && !bloquejatCalavera) {
			const minVerticalForce = 8;
			const verticalForce = Math.random() * 6 + minVerticalForce;

			body.velocity.set(
				(Math.random() * 8 - 4) * 1.5,
				verticalForce,
				(Math.random() * 8 - 4) * 1.5
			);

			const minRotation = 200;
			let rotationX = (Math.random() * 200 - 100) + minRotation;
			let rotationY = (Math.random() * 200 - 100) + minRotation;
			let rotationZ = (Math.random() * 200 - 100) + minRotation;

			if (Math.abs(rotationX) < minRotation * 1.5) rotationX *= 1.5;
			if (Math.abs(rotationY) < minRotation * 1.5) rotationY *= 1.5;
			if (Math.abs(rotationZ) < minRotation * 1.5) rotationZ *= 1.5;

			const maxRotation = Math.max(rotationX, rotationY, rotationZ);
			rotationX = (rotationX / maxRotation) * minRotation;
			rotationY = (rotationY / maxRotation) * minRotation;
			rotationZ = (rotationZ / maxRotation) * minRotation;

			body.angularVelocity.set(rotationX, rotationY, rotationZ);
		}
	}
}

		
// FUnció que controla els clics que fem als daus o al botó de tirada
function onMouseClick(event) {
	if (numTirada.value === 0) {
		console.log("🚫 No es poden clicar daus a la tirada 0.");
		return;
	}
	const rect = renderer.domElement.getBoundingClientRect();
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	const meshes = daus.map(dau => dau.mesh);
	const interseccions = raycaster.intersectObjects(meshes);

	if (interseccions.length > 0) {
		const dauTocat = interseccions[0].object;
		const index = daus.findIndex(d => d.mesh === dauTocat);
		const { body, mesh, bloquejat } = daus[index];

		// Si ja està bloquejat per calavera, no fem res
		if (daus[index].bloquejatCalavera) {
			console.log(`Dau ${index + 1} ja bloquejat per calavera, no es pot tocar.`);
			return;
		}

		if (body.type === CANNON.Body.STATIC) {
			// Desbloquegem
			body.type = CANNON.Body.DYNAMIC;
			body.mass = 500;
			body.velocity.set(0,0,0);
			body.angularVelocity.set(0,0,0);
			body.updateMassProperties();
			mesh.material.forEach(m => {
				m.opacity = 1;
				m.transparent = false;
			});
			console.log(`Dau ${index + 1} DESBLOQUEJAT`);
		} else {
			// Fixem
			body.velocity.set(0,0,0);
			body.angularVelocity.set(0,0,0);
			body.mass = 0;
			body.type = CANNON.Body.STATIC;
			body.updateMassProperties();
			mesh.material.forEach(m => {
				m.opacity = 0.6;
				m.transparent = true;
			});
			console.log(`Dau ${index + 1} FIXAT`);
		}
		guardarEstatDaus(); // IMPORTANT perquè es guardi al tancar el navegador
	}
}

function guardarEstatDaus() {
	const estatDaus = daus.map(({ body, bloquejatCalavera }) => ({
		posicio: { x: body.position.x, y: body.position.y, z: body.position.z },
		rotacio: { x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w },
		bloquejat: bloquejatCalavera || false
	}));

	localStorage.setItem("estatDaus", JSON.stringify(estatDaus));
	console.log("💾 Estat dels daus guardat a LocalStorage.");
}

function carregarEstatDaus() {
	const estatGuardat = JSON.parse(localStorage.getItem("estatDaus"));
	if (!estatGuardat || estatGuardat.length !== daus.length) return;

	for (let i = 0; i < daus.length; i++) {
		const { posicio, rotacio, bloquejat } = estatGuardat[i];
		const { body, mesh } = daus[i];

		body.position.set(posicio.x, posicio.y, posicio.z);
		body.quaternion.set(rotacio.x, rotacio.y, rotacio.z, rotacio.w);

		body.velocity.set(0, 0, 0);
		body.angularVelocity.set(0, 0, 0);

		if (bloquejat) {
			body.mass = 0;
			body.type = CANNON.Body.STATIC;
			body.updateMassProperties();
			daus[i].bloquejatCalavera = true;
			mesh.material.forEach(m => {
				m.transparent = true;
				m.color.setHex(0x707070);  // gris
			});
		}
	}
	console.log("✅ Estat dels daus carregat des de LocalStorage.");
}

// Funció que mira quines cares queden amunt
function comprovaCaresDaus() {
	let caresActuals = [];

	let totsAturats = daus.every(({ body }) => 
	body.velocity.lengthSquared() < 0.01 && body.angularVelocity.lengthSquared() < 0.01
	);

	if (totsAturats && tiradaEnProgres) {
		console.log('--------------------------');
		console.log(`Tirada ${numTirada.value}:`);

		const simbols = ["Lloro", "Moneda", "Mico", "Diamant", "Vaixell", "Calavera"];

		for (let i = 0; i < daus.length; i++) {
			const { mesh, body } = daus[i];
			const caraAmunt = obtenirCaraAmunt(mesh);

			caresActuals.push(caraAmunt);

			if (caraAmunt !== null) {
				const simbol = simbols[caraAmunt - 1]; // recorda que el primer símbol és a index 0
				console.log(`🎲 Dau ${i + 1}: ${simbol}`);

				if (simbol === "Calavera" && !daus[i].bloquejatCalavera) {
					console.log(`☠️ Dau ${i+1} mostra una calavera! BLOQUEJAT!`);

					body.velocity.set(0,0,0);
					body.angularVelocity.set(0,0,0);
					body.mass = 0;
					body.type = CANNON.Body.STATIC;
					body.updateMassProperties();
					daus[i].bloquejatCalavera = true;

					daus[i].mesh.material.forEach(m => {
						m.transparent = true;
						//m.opacity     = 0.50;           // baixa més l’opacitat
						//m.color.setHex(0xffb3b3); // vermell
						m.color.setHex(0x707070);  // gris
					});
				}
			}
		}

		console.log('--------------------------');
		tiradaEnProgres = false;
		updateFinalitzarTornButton(); // Fem que el dau de finalitzar torn torni a estar disponible
		guardarEstatDaus(); // Guardem estat dels daus

		// si estem en illaCalaveraMode, usem la nova funció; sinó, l’original
		if (illaCalaveraMode) {
			actualitzaPuntsTornIllaCalavera();
		} else {
			actualitzaPuntsTorn();
		}
	}
}


function obtenirCaraAmunt(mesh) {
	const up = new THREE.Vector3(0, 1, 0);
	const directions = [
		new THREE.Vector3(1, 0, 0),  // dreta
		new THREE.Vector3(-1, 0, 0), // esquerra
		new THREE.Vector3(0, 1, 0),  // amunt
		new THREE.Vector3(0, -1, 0), // avall
		new THREE.Vector3(0, 0, 1),  // davant
		new THREE.Vector3(0, 0, -1)  // darrera
	];
	let maxDot = -Infinity;
	let cara = null;

	for (let i = 0; i < directions.length; i++) {
		const dir = directions[i].clone().applyQuaternion(mesh.quaternion);
		const dot = dir.dot(up);
		if (dot > maxDot) {
			maxDot = dot;
			cara = i + 1; // les cares són de 1 a 6
		}
	}
	return cara;
}


// EXTENSIÓ DE LA FUNCIÓ CANVIAESCENA
const canviaEscenaOriginal = canviaEscena;
canviaEscena = function(escena){
	canviaEscenaOriginal(escena);
	if (escena === "escena-joc") {
		initDaus();
		//partidaIniciada = true;
		partidaIniciada.value = true;
		iniciarTorns(); //MODIFICACIO
		//localStorage.setItem("partidaIniciada", "true");
	}
}

// FUnció que ens canvia la carta al passar de torn
function robaCarta() {
	const guardada = cartaActual.value;
	if (guardada) {
		mostrarCartaAlUI(guardada);
	} else {
		cartaActual.value = cartes[Math.floor(Math.random() * cartes.length)];
		mostrarCartaAlUI(cartaActual.value);
	}
}

// Extensió de robaCarta()
function mostrarCartaAlUI(carta) {
	const img = document.getElementById('cartesImgSrc');
	img.src = carta.img;
	// Assignem un callback, no cridem la funció ara mateix:
	missatge = carta.desc;
	img.onclick = () => mostrarModalMissatge(missatge, false);
	//img.onclick = () => mostrarModalMissatge(carta.desc, false);
}

// Aquesta funció és de debug, serveix per fer mostrar un slider de càmera i canviar-la manualment
function setupCameraSliders() {
	
	// Populem els sliders amb els valors que hem definit a les variables globals per la càmera
	document.getElementById("camPosX").value = posXcam;
	document.getElementById("camPosY").value = posYcam;
	document.getElementById("camPosZ").value = posZcam;
	document.getElementById("camLookX").value = lookXcam;
	document.getElementById("camLookY").value = lookYcam;
	document.getElementById("camLookZ").value = lookZcam;
	document.getElementById("camFOV").value = fovcam;
	
	// Aquesta funció ens actualitza els valors si movem els sliders
	const updateCamera = () => {
		const posX = parseFloat(document.getElementById("camPosX").value);
		const posY = parseFloat(document.getElementById("camPosY").value);
		const posZ = parseFloat(document.getElementById("camPosZ").value);
		const lookX = parseFloat(document.getElementById("camLookX").value);
		const lookY = parseFloat(document.getElementById("camLookY").value);
		const lookZ = parseFloat(document.getElementById("camLookZ").value);
		const fov = parseFloat(document.getElementById("camFOV").value);
		
		document.getElementById("posX-debug").innerHTML = posX;
		document.getElementById("posY-debug").innerHTML = posY;
		document.getElementById("posZ-debug").innerHTML = posZ;
		document.getElementById("lookX-debug").innerHTML = lookX;
		document.getElementById("lookY-debug").innerHTML = lookY;
		document.getElementById("lookZ-debug").innerHTML = lookZ;
		document.getElementById("fov-debug").innerHTML = fov;
		
		camera.fov = fov;
		camera.updateProjectionMatrix(); // Actualitza la càmera amb el nou FOV
		camera.position.set(posX, posY, posZ);
		camera.lookAt(lookX, lookY, lookZ);
	};
	
	// Si aquesta funció s'està executant hem de mostrar el DIV amb els sliders
	document.getElementById("cameraControls").style.display = "block";
	
	// Inicialitzem un listener als sliders que ens actualitzarà en viu la càmera
	document.querySelectorAll("#cameraControls input").forEach(input => {
		input.addEventListener("input", updateCamera);
	});
	
}

//Funció que ens carrega els assets
function preCarregaTot(callback) {
	let carregats = 0;
	const total = arxiusACarregar.length;

	function actualitzaProgres() {
		const percentatge = Math.floor((carregats / total) * 100);
		document.getElementById("barraProgres").style.width = percentatge + "%";
		document.getElementById("numPercentatge").innerText = percentatge + "%";

		if (carregats === total) {
			document.getElementById("botoCarregant").style.display = "none";
			document.getElementById("botoIniciar").innerHTML = "Iniciar el joc";
			document.getElementById("botoIniciar").style.display = "flex";
			document.getElementById("botoIniciarContainer").style.display = "flex";
			document.getElementById("cartellPantallaCarrega").innerHTML = "Illa Calavera";
		}
	}

	arxiusACarregar.forEach((url) => {
		const extensio = url.split('.').pop().toLowerCase();
		let element;

		if (['png', 'jpg', 'jpeg', 'webp'].includes(extensio)) {
			element = new Image();
			element.onload = element.onerror = () => { carregats++; actualitzaProgres(); };
			element.src = url;
		} else if (['mp3', 'wav', 'ogg'].includes(extensio)) {
			element = new Audio();
			element.oncanplaythrough = element.onerror = () => { carregats++; actualitzaProgres(); };
			element.src = url;
		} else if (['ttf', 'woff', 'woff2'].includes(extensio)) {
			// Carreguem fonts creant un <link> invisible
			/* OMETEM LES FONTS DE MOMENT
			element = document.createElement('link');
			element.rel = 'preload';
			element.href = url;
			element.as = 'font';
			element.onload = element.onerror = () => { carregats++; actualitzaProgres(); };
			document.head.appendChild(element);
			*/
		} else {
			console.warn("No sé com carregar:", url);
			alert("No sé com carregar:");
			carregats++;
			actualitzaProgres();
		}
	});
}

// Funció que ens permet que el contenidor on dibuixem el joc tingui sempre la mateixa ratio de 1400x800px
// Així podem treballar en pixels sempre, i si per cas tenim una pantalla més gran o més petita, la ratio serà la mateixa (sols que es veurà més gran, o més petit)
function escalarContenidor() {
	let cont = document.getElementById("contenidor"); // Triem el DIV
	//let escalaX = window.innerWidth / 1400; // Amplada desitjada
	//let escalaY = window.innerHeight / 800; // Alçada desitjada
	let escalaX = window.innerWidth / 1920; // Amplada desitjada
	let escalaY = window.innerHeight / 1080; // Alçada desitjada
	let escalaFinal = Math.min(escalaX, escalaY); // Calculem
	cont.style.transform = `translate(-50%, -50%) scale(${escalaFinal})`; // Apliquem escala (si escau)
}

// Funcions automàtiques
// Indiquem que la funció 'escalarContenidor' s'executi sempre que la finestra canvii de mida. També quan la finestra carrega per primer cop
window.addEventListener("resize", escalarContenidor);
window.addEventListener("load", escalarContenidor);

// Evitem el zoom amb els dits en els telèfons
document.addEventListener("gesturestart", function (e) {
	e.preventDefault();
});

document.addEventListener("click", function () {
	let musica = document.getElementById("musica-fons");
	if (musica.paused) {
		musica.play().catch(error => console.log("Autoplay bloquejat:", error));
	}
}, { once: true }); // Executem aquest esdeveniment només una vegada

// Aquí afegim el listener per tancar el teclat si cliquem fora
document.addEventListener("click", function (e) {
	const teclat = document.getElementById("teclatPersonalitzat");
	if (teclat.classList.contains("teclatOcult")) return;
	if (teclat.contains(e.target)) return;
	if (e.target.closest(".jugadorAvatar")) return;
	tancarTeclat();
});
			
// Un cop el doc està caregat completament
document.addEventListener("DOMContentLoaded", function () {
		// Escena inicial
		carregaEscena("escena-pantallaCarrega");
		escalarContenidor();
		//preCarregaTot();
		
		preCarregaTextures(() => {
			preCarregaTot(); // Precarreguem altres assets
		});
			
		const música = document.getElementById('musica-fons');
		música.volume = 0.5;

		// Carreguem llista de jugadors si n'hi havia
		const llistaGuardada = JSON.parse(localStorage.getItem("llistaJugadors")) || [];

		if (llistaGuardada.length > 0 && partidaIniciada.value) {
			llistaJugadors = llistaGuardada;
			sincronitzaJugadorsAmbPantalla(); 
		}
		
		const numTiradaGuardada = numTirada.value;
		if (numTiradaGuardada !== null) {
			numTirada.value = parseInt(numTiradaGuardada, 10);
		}else{
			numTirada.value = 0;
		}
			
		const puntsTornActualGuardat = puntsTornActual.value;
		if (puntsTornActualGuardat !== null) {
			puntsTornActual.value = parseInt(puntsTornActualGuardat, 10);
		} else {
			puntsTornActual.value = 0;
		}

		updateFinalitzarTornButton();

		// Si la partida ja estava començada, canviem el botó principal
		
		if (partidaIniciada.value) {
			const botoIniciarPantallaInici = document.getElementById("escena-pantallaInici-botoIniciarPartida");
			if (botoIniciarPantallaInici) {
				if (partidaIniciada.value) {
					botoIniciarPantallaInici.innerText = "Continuar partida";
					botoIniciarPantallaInici.onclick = function () {
						carregaEscena("escena-joc");
					};
				} else {
					botoIniciarPantallaInici.onclick = function () {
						carregaEscena("escena-configuraPartida");
					};
				}
			}
			document.getElementById("botoEliminarPartidaContainer").style.display = "flex";
		}else{
			document.getElementById("botoEliminarPartidaContainer").style.display = "none";
		}
});

// FUnció que sincronitza els jugadors a pantalla
function sincronitzaJugadorsAmbPantalla() {
	llistaJugadors.forEach(j => {
		const avatar = document.getElementById("jugadorAvatar" + j.id);
		const input = document.getElementById("nom" + j.id);
		if (avatar && input) {
			avatar.classList.remove("avatarDesactivat");
			avatar.classList.add("avatarActivat");
			input.disabled = false;
			input.value = j.nom;
		}
	});
}



function netejaPantallaConfiguracioJugadors() {
  for (let i = 1; i <= 6; i++) {
    const avatar = document.getElementById("jugadorAvatar" + i);
    const input = document.getElementById("nom" + i);
    if (!avatar || !input) continue;

    avatar.classList.remove("avatarActivat");
    avatar.classList.add("avatarDesactivat");
    input.disabled = true;
    input.value = "";
  }

  const botoSeguent = document.getElementById("botoSeguentConfigurarPartida");
  if (botoSeguent) botoSeguent.style.display = "none";
}



// Si més endavant vols poder "esborrar" la partida manualment (opcional):
function reiniciaPartida() {
  localStorage.removeItem("llistaJugadors");
  //localStorage.removeItem("partidaIniciada");
  localStorage.removeItem("estatDaus");
  //localStorage.removeItem("numTirada");
  //localStorage.removeItem("puntsTornActual");
  //localStorage.removeItem('cartaActual');
  
  // Eliminem localStorage
  partidaIniciada.clear();
  partidaFinalitzada.clear();
  puntsTornActual.value = 0;
  numTirada.value = 0;
  cartaActual.value = null;
  //alert(numTirada.value);
  //numTirada.clear();

  llistaJugadors = [];
  //partidaIniciada = false;
  //numTirada = 0;
  //puntsTornActual = 0;
  illaCalaveraMode = false;
  
  desbloquejarTotsElsDaus();
    actualitzaTornsPantalla();
	
	
  //location.reload();
  netejaPantallaConfiguracioJugadors(); // <-- AFEGIT
  
  
    // 4. Amagar parts visuals de partida
  document.getElementById("finalitzarTornContainer").style.display = "none";
  //document.getElementById("tornActual").style.display = "none";
  document.getElementById("puntsProvisional").style.display = "none";
  document.getElementById("puntuacionsJugadorsMid").innerHTML = "";
  
  
  
  carregaEscena("escena-pantallaInici");
  //location.reload();
} 

		
		
		
		
		
		function mostrarModalPersonatges() {
	document.getElementById("modalPersonatges").style.display = "flex";
}

function tancarModalPersonatges() {
	document.getElementById("modalPersonatges").style.display = "none";
}
		
		
  function toggleMusica() {
    const musicEl = document.getElementById('musica-fons');
    const sfxEls  = [
      document.getElementById('audio-dau'),
      document.getElementById('audio-daus'),
      document.getElementById('audio-botoPirata'),
      document.getElementById('audio-botoGeneral')
    ];
    const btn = document.getElementById('musicButton');
	const btn2 = document.getElementById('musicButton2');

    // assegurem volum de fons al 50%
    musicEl.volume = 0.5;

    // passem al següent estat
    audioState = (audioState + 1) % 4;

    const musicOn   = (audioState === 0 || audioState === 2);
    const effectsOn = (audioState === 0 || audioState === 1);

    musicEl.muted = !musicOn;
    sfxEls.forEach(el => el.muted = !effectsOn);

    // actualitzem la imatge del botó
    switch (audioState) {
      case 0: btn.src = 'img/music_on-SFX_on.png';btn2.src = 'img/music_on-SFX_on.png';  break;
      case 1: btn.src = 'img/music_off-SFX_on.png';btn2.src = 'img/music_off-SFX_on.png'; break;
      case 2: btn.src = 'img/music_on-SFX_off.png';btn2.src = 'img/music_on-SFX_off.png'; break;
      case 3: btn.src = 'img/music_off-SFX_off.png';btn2.src = 'img/music_off-SFX_off.png';break;
    }

    // opcional: si vols que la música s'iniciï automàticament en activar-la
    if (musicOn) {
      musicEl.play().catch(()=>{/* l'usuari ha de fer interacció */});
    }
  }
		
		
		
  let inputActiu = null;
  let canviantJugador = false;


  function mostrarTeclat(jugador) {
  //tancarTeclat();
  
    const teclat = document.getElementById("teclatPersonalitzat");
    teclat.className = "teclat"; // Netegem classes

    switch(jugador) {
      case 1: case 4:
        teclat.classList.add("teclatDreta"); break;
      case 3: case 6:
        teclat.classList.add("teclatEsquerra"); break;
      case 2:
        teclat.classList.add("teclatAbaix"); break;
      case 5:
        teclat.classList.add("teclatAdalt"); break;
    }

    teclat.classList.remove("teclatOcult");
    inputActiu = document.getElementById("nom" + jugador);
  }

  
  function teclaVirtual(caracter) {
  if (inputActiu) {
    inputActiu.value += caracter;
    const num = parseInt(inputActiu.id.replace("nom", ""));
    actualitzaLlistaJugador(num, "afegir");
	console.log(`Tecla afegida: ${caracter} → Nou valor: ${inputActiu.value}`);

  }
}

  
  


function tancarTeclat(){
  const teclat = document.getElementById("teclatPersonalitzat");
  teclat.classList.add("teclatOcult");

  if (!canviantJugador && inputActiu && inputActiu.value.trim() === "") {
    const id = inputActiu.id; // ex: nom4
    const num = parseInt(id.replace("nom", ""));
    const avatar = document.getElementById("jugadorAvatar" + num);
    avatar.classList.remove("avatarActivat");
    avatar.classList.add("avatarDesactivat");
    inputActiu.disabled = true;
    inputActiu.value = "";
  }

  inputActiu = null;
  canviantJugador = false; // Reiniciem estat
}


  
  function borrarTecla() {
  if (inputActiu) {
    inputActiu.value = inputActiu.value.slice(0, -1);
    const num = parseInt(inputActiu.id.replace("nom", ""));
    if (inputActiu.value.trim() === "") {
      actualitzaLlistaJugador(num, "eliminar");
    } else {
      actualitzaLlistaJugador(num, "afegir");
    }
  }
}




function seleccionarJugador(num) {
  const inputActual = document.getElementById("nom" + num);
  const avatarActual = document.getElementById("jugadorAvatar" + num);

  if (avatarActual.classList.contains("avatarActivat")) {
    avatarActual.classList.remove("avatarActivat");
    avatarActual.classList.add("avatarDesactivat");
    inputActual.disabled = true;
    inputActual.value = "";
    actualitzaLlistaJugador(num, "eliminar");
    tancarTeclat();
    return;
  }

  // Eliminem altres jugadors buits abans d’activar-ne un de nou
  for (let i = 1; i <= 6; i++) {
    if (i === num) continue;

    const input = document.getElementById("nom" + i);
    const avatar = document.getElementById("jugadorAvatar" + i);

    if (avatar.classList.contains("avatarActivat") && input.value.trim() === "") {
      avatar.classList.remove("avatarActivat");
      avatar.classList.add("avatarDesactivat");
      input.disabled = true;
      input.value = "";
      actualitzaLlistaJugador(i, "eliminar");
    }
  }

  avatarActual.classList.remove("avatarDesactivat");
  avatarActual.classList.add("avatarActivat");
  inputActual.disabled = false;
  inputActual.focus();
  mostrarTeclat(num);
  actualitzaLlistaJugador(num, "afegir");
}


function actualitzaLlistaJugador(num, accio) {
	
	const audioBoto = document.getElementById('audio-botoGeneral');
	if (audioBoto) { audioBoto.currentTime = 0; audioBoto.play().catch(() => {}); }
	
	
	const input = document.getElementById("nom" + num);

	if (accio === "afegir") {
		const nom = input.value.trim();
		if (nom === "") return;

		if (!llistaJugadors.find(j => j.id === num)) {
			llistaJugadors.push({
				id: num,
				nom: nom,
				poder: num, // número de 1 a 6 que identifica el poder
				punts: 0,
				torn: false
			});
		}
		
		
		const existent = llistaJugadors.find(j => j.id === num);
if (existent) {
  existent.nom = nom; // Actualitza el nom si ja existeix
} else {
  llistaJugadors.push({
    id: num,
    nom: nom,
    poder: num, // canviable després
    punts: 0,
    torn: false
  });
}

		
		
		
		
		console.log("Editant jugador amb ID:", num, "→ Nom:", nom);

	} else if (accio === "eliminar") {
		llistaJugadors = llistaJugadors.filter(j => j.id !== num);
	}
console.log("Llista actualitzada:");
console.log(JSON.stringify(llistaJugadors, null, 2));


 const botoSeguent = document.getElementById("botoSeguentConfigurarPartida");
  if (botoSeguent) {
    botoSeguent.style.display = llistaJugadors.length >= 2 ? "block" : "none";
  }


	guardarLlistaJugadors();
}


function actualitzaPantallaInici() {
  const botoIniciarPantallaInici = document.getElementById("escena-pantallaInici-botoIniciarPartida");
  //const botoEliminar1 = document.getElementById("botoEliminarPartida1");
  const botoEliminar = document.getElementById("botoEliminarPartidaContainer");

  //if (localStorage.getItem("partidaIniciada") === "true") {
	  if (partidaIniciada.value) {
    botoIniciarPantallaInici.innerText = "Continuar partida";
    botoIniciarPantallaInici.onclick = function () {
      carregaEscena("escena-joc");
    };
    //botoEliminar1.style.display = "block";
    botoEliminar.style.display = "flex";
  } else {
    botoIniciarPantallaInici.innerText = "Iniciar partida";
    botoIniciarPantallaInici.onclick = function () {
      carregaEscena("escena-configuraPartida");
    };
    //botoEliminar1.style.display = "none";
    botoEliminar.style.display = "none";
  }
}




// Funcions localStorage

function guardarLlistaJugadors() {
  localStorage.setItem("llistaJugadors", JSON.stringify(llistaJugadors));
  //localStorage.setItem("partidaIniciada", "true");
}











// Funcions no rellevants per el transcurs del joc

	// Funció que activa o desactiva la pantalla completa
	function pantallaCompleta() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch((err) => {
				alert(`Error al intentar entrar en mode pantalla completa: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	}

// FI Funcions no rellevants per el transcurs del joc
