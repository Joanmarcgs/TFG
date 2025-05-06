// FUNCIONS I DECLARACIONS globals
	
	// Definim primer de tot el service worker que ens fa el joc disponible offline
	if ('serviceWorker' in navigator) {
	  // Assegura’t que esperem al load, així el DOM i tots els recursos ja són accessibles
	  window.addEventListener('load', () => {
		navigator.serviceWorker.register('sw.js')
		  .then(reg => console.log('SW registrat amb èxit:', reg))
		  .catch(err => console.error('Error en registrar SW:', err));
	  });
	}
	
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
	let partidaIniciada = false; // Controla si hi ha una partida en curs
	let primerTiradaFeta = false; // Controla si s'ha fet una tirada ja en el torn present
	let cartaActual = null; // Controla quina carta està activa en el torn present

	// Llista de cartes modificadores de torn
	const cartes = [
	  { id: 'Boti',          img: 'img/cartesTresor.png',        desc: 'Perdre torn per 3 calaveres et permet mantenir els punts', },
	  { id: 'Pirata',        img: 'img/cartesPirata.png',        desc: 'Duplica la puntuació final del torn',       },
	  { id: 'Calavera1',     img: 'img/cartesCalavera1.png',        desc: 'Activa una calavera al tauler',        },
	  { id: 'Calavera2',     img: 'img/cartesCalavera2.png',        desc: 'Activa dues calaveres al tauler',     },
	  { id: 'Vaixell2',      img: 'img/cartesVaixell2.png',        desc: 'Has de finalitzar el torn amb 2 vaixells o més per guanyar 500 punts. Si no, en perds 500', },
	  { id: 'Vaixell4',      img: 'img/cartesVaixell4.png',        desc: 'Has de finalitzar el torn amb 4 vaixells o més per guanyar 1000 punts. Si no, en perds 1000',},
	  { id: 'Diamant',       img: 'img/cartesDiamant.png',        desc: 'Activa un diamant al tauler',                  },
	  { id: 'Or',            img: 'img/cartesMoneda.png',        desc: 'Activa una moneda al tauler',                       },
	  { id: 'Animals',       img: 'img/cartesAnimals.png',        desc: 'Micos i lloros compten com un mateix símbol',},
	];
// FI FUNCIONS I DECLARACIONS globals

			// Funcions CUSTOM que hem generat per treballar més eficientment
			
			// Funció que cridem cada cop que volem carregar una escena
			function carregaEscena(escena){
			
			// si demanes tornar enrere, substitueix per l'anterior
  if (escena === 'escena-anterior') {
    escena = escenaAnterior || 'escena-pantallaInici';
  }
  // abans de canviar, desa quina era l'escena activa
  const abans = escenaActiva;
  
  
				switch(escena){
					case "escena-pantallaCarrega": // Tornem a pantalla inicial
						//amagaEscenes(); // Amaguem totes les escenes
						//mostraEscena(escena); // Carreguem escena de pantalla d'inici
						canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
					break;
					case "escena-pantallaInici": // Tornem a pantalla inicial
						//amagaEscenes(); // Amaguem totes les escenes
						//mostraEscena(escena); // Carreguem escena de pantalla d'inici
						actualitzaPantallaInici(); // <--- AFEGEIX AIXÒ!
						canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
					break;
					case "escena-configuraPartida": // Iniciem una partida
						//amagaEscenes(); // Amaguem totes les escenes
						//mostraEscena(escena); // Carreguem escena que de configuració de partida
						//numTirada = 0;
						canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
					break;
					case "escena-instruccions": // Veiem les instruccions del joc
						//amagaEscenes(); // Amaguem totes les escenes
						//mostraEscena(escena); // Carreguem escena amb les instruccions del joc
						canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
					break;
					case "escena-credits": // Veiem les instruccions del joc
						//amagaEscenes(); // Amaguem totes les escenes
						//mostraEscena(escena); // Carreguem escena amb les instruccions del joc
						canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
					break;
					case "escena-joc":
						canviaEscena(escena); // Funció que amaga l'escena activa i mostra la desitjada
					break;
					case "escena-anterior":
					  // ja està resolt a l'inici de la funció
					  break;
				
				}
				 // actualitza escenaAnterior
  escenaAnterior = abans;
			}
			
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
			
			
			

			function actualitzaPuntuacions() {
				const div = document.getElementById("puntuacionsJugadorsMid");
				if (!div) return;

				div.innerHTML = "<h2>Puntuació</h2><h3>~~~~~~</h3>";
				llistaJugadors.forEach(j => {
					div.innerHTML += "<div style='padding:10px;'>"+j.nom+"<br>"+j.punts+" </div> ";
				});
			}
			
			
			
			
			let puntsTornActual = 0;

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

    document.getElementById("finalitzarTornContainer").style.display = "flex";
    //document.getElementById("tornActual").style.display = "block";
    document.getElementById("puntsProvisional").style.display = "block";

    //document.getElementById("nomJugadorActiu").textContent = jugadorActiu.nom;
    document.getElementById("puntsTornActiu").textContent = puntsTornActual;

    // 🔥 ACTUALITZA avatar i nom centrat
    const avatarDisplay = document.getElementById("jugadorActiuInfo");
    const avatarImg = document.getElementById("avatarJugadorActiu");
    const nomDisplay = document.getElementById("nomJugadorActiuDisplay");

    avatarImg.src = jugadorActiu.avatar || "img/avatar"+jugadorActiu.poder+".png"; // Valor per defecte
    nomDisplay.textContent = jugadorActiu.nom;

    avatarDisplay.style.display = "block";
	
	robaCarta();
}


function mostrarModalMissatge(text, callback) {
  document.getElementById("textModalMissatge").textContent = text;
  document.getElementById("modalMissatge").style.display = "flex";
  document.getElementById("modalMissatge").dataset.callback = callback ? "true" : "";
}

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
  const puntsProv = document.getElementById("resumPuntsTornActiu");
  // llegeix el display computat, no l’inline
  const actual = window.getComputedStyle(puntsProv).getPropertyValue("display");
  puntsProv.style.display = (actual === "none") ? "block" : "none";
}



// Funció per calcular els punts actuals del torn, incloent combinacions especials


let numCalaveres = 0;

let illaCalaveraMode = false;
let calaveresIllaAcumulades = 0;

function actualitzaPuntsTorn() {
    const cares = [];
    numCalaveres = 0;
    puntsTornActual = 0;

    let comptadorMonedes = 0;
    let comptadorDiamants = 0;
    let missatgesResum = [];

	let missatge = '';

switch(cartaActual.id) {
  case 'Diamant':
	comptadorDiamants++;
	puntsTornActual += 100;
	missatge = `💎 Sumes un diamant per carta modificadora!`;
     console.log(missatge);
       missatgesResum.push(missatge);
  break;
  case 'Or':
	comptadorMonedes++;
	puntsTornActual += 100;
	missatge = `🪙 Sumes una moneda d'or per carta modificadora!`;
     console.log(missatge);
       missatgesResum.push(missatge);
  break;
}



    for (let { mesh } of daus) {
        const cara = obtenirCaraAmunt(mesh);
        if (cara) cares.push(cara);

        if (cara === 2) {
            puntsTornActual += 100;
            comptadorMonedes++;
        }
        if (cara === 4) {
            puntsTornActual += 100;
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
	switch (cartaActual.id) {
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
        puntsTornActual += bonusAvatar;
      }
    }
	
	
	
	puntsTornActual += bonusCombinacio;
    document.getElementById("puntsTornActiu").textContent = puntsTornActual;
    localStorage.setItem('puntsTornActual', puntsTornActual);








	
switch(cartaActual.id) {
  case 'Pirata':
    // xo₂ al final
    puntsTornActual *= 2;
    missatgesResum.push(`☠️ Pirata: puntuació x2 = ${puntsTornActual}`);
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
      puntsTornActual += 500;
      missatgesResum.push(`🚢×2: +500 punts per ≥2 vaixells`);
    } else {
      puntsTornActual -= 500;
      missatgesResum.push(`🚢×2: -500 punts per <2 vaixells`);
    }
    break;
  case 'Vaixell4':
    const v4 = comptador[5] || 0;
    if (v4 >= 4) {
      puntsTornActual += 1000;
      missatgesResum.push(`🚢×4: +1000 punts per ≥4 vaixells`);
    } else {
      puntsTornActual -= 1000;
      missatgesResum.push(`🚢×4: -1000 punts per <4 vaixells`);
    }
    break;
	
	/*
  case 'Animals':
    // re-calcula combos sumant micos + lloros
    const totAnimals = (comptador[1]||0) + (comptador[3]||0);
    if (totAnimals >= 3) {
      const ptsA = [0,0,100,200,500,1000,2000,4000][totAnimals] || 0;
      puntsTornActual += ptsA;
      missatgesResum.push(`🐒🦜 Animals carta: +${ptsA} punts per ${totAnimals} iguals`);
    }
    break;
	*/
	case 'Animals':
  // 1) Restem els punts que ja s'hagin posat per separat (micos i lloros)
  function ptsCombo(n) { return [0,0,100,200,500,1000,2000,4000][n]||0; }

  const cntLloro = comptador[1] || 0;
  const cntMico  = comptador[3] || 0;
  let sub = 0;
  if (cntLloro >= 3) sub += ptsCombo(cntLloro);
  if (cntMico  >= 3) sub += ptsCombo(cntMico);
  if (sub) {
    puntsTornActual -= sub;
    missatgesResum.push(`🐒🦜 Animals carta: restem ${sub} punts de combos separats`);
  }

  // 2) Sumem el combo únic amb tots dos barrejats
  const totAnimals = cntLloro + cntMico;
  if (totAnimals >= 3) {
    const ptsA = ptsCombo(totAnimals);
    puntsTornActual += ptsA;
    missatgesResum.push(`🐒🦜 Animals carta: +${ptsA} punts per ${totAnimals} cares iguals`);
  }
  break;

	
}
	
	


//puntsTornActual += bonusCombinacio;
    document.getElementById("puntsTornActiu").textContent = puntsTornActual;
    localStorage.setItem('puntsTornActual', puntsTornActual);














    // Mostrem el resum al span
    document.getElementById("resumPuntsTornActiu").innerHTML = missatgesResum.join('   ');
	
	
	/*
	if (numCalaveres == 3) {
        
        if(cartaActual.id=="Boti"){
		mostrarModalMissatge("☠️ Has tret 3 calaveres! Perds el torn! Gràcies a la carta de Botí t'endús "+puntsTornActual+" punts!", true);
		}else{
		mostrarModalMissatge("☠️ Has tret 3 calaveres! Perds el torn!", true);
		puntsTornActual = 0;
		}
		
		
		
        //finalitzarTorn();
        document.getElementById("resumPuntsTornActiu").textContent = "";
        return;
    }
	
	
	
	*/
	
	if (numCalaveres == 3) {
    let penal = 0;
    if (cartaActual.id === "Vaixell2") penal = 500;
    if (cartaActual.id === "Vaixell4") penal = 1000;

    if (cartaActual.id === "Boti") {
        // el Botí ja manté punts normals: no tocar
        mostrarModalMissatge(
          `☠️ Has tret 3 calaveres! Perds el torn! Gràcies a la carta de Botí t'endús ${puntsTornActual} punts!`,
          true
        );
    } else {
        // si és carta de vaixell, assignem un valor negatiu a puntsTornActual
        puntsTornActual = -penal;
        let miss = `☠️ Has tret 3 calaveres! Perds el torn!`;
        if (penal > 0) miss += ` A més perds ${penal} punts per la carta de ${cartaActual.id}.`;
        mostrarModalMissatge(miss, true);
    }

    document.getElementById("resumPuntsTornActiu").textContent = "";
    return;
}

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

/*
    if (numCalaveres > 3) {
        mostrarModalMissatge("Has tret 4 calaveres o més! Anem a Illa Calavera!☠️☠️☠️☠️", true);
        puntsTornActual = 0;
        document.getElementById("resumPuntsTornActiu").textContent = "☠️☠️☠️☠️ Illa Calavera!";
        return;
    }
	*/
			if (numCalaveres > 3 && !illaCalaveraMode) {
			// 1) entrem en “Illa Calavera”
			illaCalaveraMode = true;
			calaveresIllaAcumulades = numCalaveres;
/*
			// 2) assignem punts inicials: +100 per calavera al jugador actiu...
			puntsTornActual = calaveresIllaAcumulades * 100;
			// ...i -200 per calavera a cada altre jugador
			const penal = calaveresIllaAcumulades * 200;
			llistaJugadors.forEach(j => {
				if (!j.torn) j.punts -= penal;
			});
*/
			// 3) mostrem missatge i sortim
			const text = `☠️ Illa Calavera activada! Acumula calaveres per restar punts als rivals!`;
			mostrarModalMissatge(text, false);
			document.getElementById("resumPuntsTornActiu").textContent =
			  `☠️ Illa Calavera: ${calaveresIllaAcumulades} calaveres`;

			return;
		}

	
	
	
}

/*

function actualitzaPuntsTornIllaCalavera() {
    // tornem a llegir les cares de tots els daus
    const cares = daus.map(d => obtenirCaraAmunt(d.mesh));
    // comptem quantes calaveres hi ha ara
    const total = cares.filter(c => c === 6).length;

    // noves calaveres des de l’inici d’Illa
    const noves = total - calaveresIllaAcumulades;
    if (noves <= 0) return;

    // acumulem
    calaveresIllaAcumulades = total;
    const ptsSelf = noves * 100;
    const penal = noves * 200;

    puntsTornActual += ptsSelf;
    llistaJugadors.forEach(j => {
        if (!j.torn) j.punts -= penal;
    });

    // actualitza UI
    document.getElementById("puntsTornActiu").textContent = puntsTornActual;
    document.getElementById("resumPuntsTornActiu").innerHTML =
      `☠️ Illa Calavera x${calaveresIllaAcumulades}: +${ptsSelf} (rivals -${penal})`;
}
*/

function actualitzaPuntsTornIllaCalavera() {
    // 0) comprova si hi ha calaveres noves; si no, acabem el torn
    const cares = daus.map(d => obtenirCaraAmunt(d.mesh));
    const total = cares.filter(c => c === 6).length;
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

    puntsTornActual += ptsSelf;
    llistaJugadors.forEach(j => {
        if (!j.torn) j.punts -= penal;
    });

    // 2) actualitza la UI
    document.getElementById("puntsTornActiu").textContent = puntsTornActual;
    document.getElementById("resumPuntsTornActiu").innerHTML =
      `☠️ Illa Calavera x${calaveresIllaAcumulades}: +${ptsSelf} (rivals -${penal})`;
}






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




























function finalitzarTorn() {


    const entrantEnIlla = !!illaCalaveraMode;
    const skulls = calaveresIllaAcumulades;

    // 1) si estàvem en mode Illa Calavera, ara sí que apliquem guany i penalització
    if (entrantEnIlla) {
        // +100 per calavera al jugador actiu
        puntsTornActual = skulls * 100;
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
    jugadorActiu.punts += puntsTornActual;
    console.log(`🏆 ${jugadorActiu.nom} guanya ${puntsTornActual} punts. Total: ${jugadorActiu.punts}`);


  // ← Aquí comprovem si ha arribat a 10000 punts
  if (jugadorActiu.punts >= 10000) {
    mostrarModalMissatge(`🎉 Enhorabona ${jugadorActiu.nom}! Has arribat a 10000 punts i guanyes la partida!`, false);
    // Opcional: amagar controls per no seguir tirant
    document.getElementById("dauTiradesContainer")?.remove();
    document.getElementById("finalitzarTornContainer")?.remove();
    return;  // sortim de la funció per no passar torn
  }



    // Passem al següent jugador
    llistaJugadors[jugadorActiuIndex].torn = false;
    const següentIndex = (jugadorActiuIndex + 1) % llistaJugadors.length;
    llistaJugadors[següentIndex].torn = true;
	
	localStorage.removeItem('cartaActual');
	
    puntsTornActual = 0;

    localStorage.setItem("llistaJugadors", JSON.stringify(llistaJugadors));


		numTirada = 0;
  localStorage.setItem('numTirada', numTirada);
  updateFinalitzarTornButton();
  //updateNumTiradaDisplay();
  
   document.getElementById("resumPuntsTornActiu").textContent = "";
		
    actualitzaPuntuacions();
	desbloquejarTotsElsDaus();
    actualitzaTornsPantalla();
	

	
}

function updateFinalitzarTornButton() {
  const botoFinalitzar = document.getElementById('botoFinalitzarTorn');
  if (numTirada === 0 || tiradaEnProgres) {
    botoFinalitzar.style.display = 'none';
  } else {
    botoFinalitzar.style.display = 'flex';
  }
}

/*
function updateNumTiradaDisplay() {
  const marcadorTirada = document.getElementById('numTiradaDisplay');
  marcadorTirada.textContent = `Tirada nº ${numTirada}`;
}
*/


function desbloquejarTotsElsDaus() {
    for (let dau of daus) {
        // Només desbloquegem si estava bloquejat per calavera
        //if (dau.bloquejatCalavera) {
            dau.body.type = CANNON.Body.DYNAMIC;
            dau.body.mass = 500;
            dau.body.updateMassProperties();
            dau.bloquejatCalavera = false;
            if (dau.mesh && dau.mesh.material) {
                dau.mesh.material.forEach(m => {
                    m.opacity = 1;
                    m.transparent = false;
                });
            }
        //}
    }
}


			


			
			let escenaDausInicialitzada = false;
			let scene, camera, renderer, world;
			const daus = [];
			const limitPixels = 50;
			const maxHeight = 8;
			let numTirada = 0;
			let tiradaEnProgres = false;

			
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
			
			// Definim les imatges de les cares dels daus
			
			const caresDauSprite = 'img/dauCompletCompressed.png';
			const caresDauMaterial = []; // Aquí guardem els materials creats des del sprite
			
			
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
			

			// Constants que ens defineixen el poder tocar els daus amb el ratolí
			const raycaster = new THREE.Raycaster();
			const mouse = new THREE.Vector2();


			function initDaus() {
				if (escenaDausInicialitzada) return;
				escenaDausInicialitzada = true;

				scene = new THREE.Scene();
				//scene.background = new THREE.Color(0xf0f0f0);

				camera = new THREE.PerspectiveCamera(50, 1920/1080, 0.1, 1000);
				//camera.position.set(0, 15, 20);
				//camera.lookAt(0, -2, 0);
				
				
				
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

				// Afegim botó provisional per fer proves (pots personalitzar-lo)
				/*
				let boto = document.createElement("button");
				boto.innerText = "Tirar Daus";
				boto.style.position = "absolute";
				boto.style.top = "20px";
				boto.style.left = "20px";
				boto.onclick = tirarDaus;
				document.getElementById("escena-joc").appendChild(boto);
				*/
				
				
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

			function animate() {
				requestAnimationFrame(animate);
				world.step(1 / 60);

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

				  comprovaCaresDaus(); // <----- 🔥 AFEGEIX AIXÒ

				renderer.render(scene, camera);
				actualitzaPuntuacions();

			}

			
			function tirarDaus() {
				if (tiradaEnProgres) {
					console.log("⏳ Tirada en curs. Espera que acabi abans de tornar a tirar.");
					return;
				}
				tiradaEnProgres = true;
				numTirada++;
				updateFinalitzarTornButton();
				
				console.log(`➤ Llançant tirada ${numTirada}...`);
				  localStorage.setItem('numTirada', numTirada);
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

		
			
function onMouseClick(event) {
	if (numTirada === 0) {
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
            // 🔵 Desbloquegem
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
            // 🔴 Fixem
            body.velocity.set(0,0,0);
            body.angularVelocity.set(0,0,0);
            body.mass = 0;
            body.type = CANNON.Body.STATIC;
            body.updateMassProperties();
            mesh.material.forEach(m => {
                m.opacity = 0.7;
                m.transparent = true;
            });
            console.log(`Dau ${index + 1} FIXAT`);
        }
		  guardarEstatDaus(); // <<<<< AFEGIR AIXÒ AQUÍ
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
		 
		 // 🔥 AFEGIT
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
		
		
        if (bloquejat) {
            body.mass = 0;
            body.type = CANNON.Body.STATIC;
            body.updateMassProperties();
            daus[i].bloquejatCalavera = true;
            mesh.material.forEach(m => {
                m.opacity = 0.5;
                m.transparent = true;
            });
        }
    }
    console.log("✅ Estat dels daus carregat des de LocalStorage.");
}



function comprovaCaresDaus() {
    let caresActuals = [];

    let totsAturats = daus.every(({ body }) => 
        body.velocity.lengthSquared() < 0.01 && body.angularVelocity.lengthSquared() < 0.01
    );

    if (totsAturats && tiradaEnProgres) {
        console.log('--------------------------');
        console.log(`Tirada ${numTirada}:`);

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
                        m.opacity = 0.5;
                        m.transparent = true;
                    });
                }
            }
        }

        console.log('--------------------------');
        tiradaEnProgres = false;
		updateFinalitzarTornButton(); // Fem que el dau de finalitzar torn torni a estar disponible
		guardarEstatDaus(); // Guardem estat dels daus
		//actualitzaPuntsTorn();
		
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
				  partidaIniciada = true;
				  iniciarTorns(); //MODIFICACIO
				  localStorage.setItem("partidaIniciada", "true");
				}

			}
			
			
			
			
			
			function robaCarta() {
				 // Si ja en tenim una guardada, la recarreguem
				  const guardada = localStorage.getItem('cartaActual');
				  if (guardada) {
					cartaActual = JSON.parse(guardada);
				  } else {
					cartaActual = cartes[Math.floor(Math.random() * cartes.length)];
					localStorage.setItem('cartaActual', JSON.stringify(cartaActual));
				  }
				  mostrarCartaAlUI(cartaActual);
			}
/*
			function mostrarCartaAlUI(carta) {
				//document.getElementById('cartaNom').textContent  = carta.id;
				//document.getElementById('cartaDesc').textContent = carta.desc;
				document.getElementById('cartesImgSrc').src = carta.img;
			}
*/

			function mostrarCartaAlUI(carta) {
			  const img = document.getElementById('cartesImgSrc');
			  img.src = carta.img;
			  // Assignem un callback, no cridem la funció ara mateix:
			  img.onclick = () => mostrarModalMissatge(carta.desc, false);
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
			}, { once: true }); // Executa aquest esdeveniment només una vegada
			
			// Aquí afegim el listener per tancar el teclat si cliquem fora
				document.addEventListener("click", function (e) {
					const teclat = document.getElementById("teclatPersonalitzat");
					if (teclat.classList.contains("teclatOcult")) return;
					if (teclat.contains(e.target)) return;
					if (e.target.closest(".jugadorAvatar")) return;
					tancarTeclat();
				});
			
			
			




// Aquest codi va dins del bloc DOMContentLoaded (cap al final del document)
document.addEventListener("DOMContentLoaded", function () {
  // Escena inicial
  carregaEscena("escena-pantallaCarrega");
  escalarContenidor();
  //preCarregaTot();
  
  preCarregaTextures(() => {
        preCarregaTot(); // Precarrega altres assets si vols
    });

  // Carreguem llista de jugadors si n'hi havia
  const llistaGuardada = JSON.parse(localStorage.getItem("llistaJugadors")) || [];
  const partidaGuardada = localStorage.getItem("partidaIniciada") === "true";

  if (llistaGuardada.length > 0 && partidaGuardada) {
    llistaJugadors = llistaGuardada;
    partidaIniciada = true;
	sincronitzaJugadorsAmbPantalla(); // <-- AFEGEIX AIXÒ!
  }
  
  const numTiradaGuardada = localStorage.getItem('numTirada');
    if (numTiradaGuardada !== null) {
      numTirada = parseInt(numTiradaGuardada, 10);
      
    }else{
		numTirada = 0;
	}
	
	const puntsTornActualGuardat = localStorage.getItem('puntsTornActual');
if (puntsTornActualGuardat !== null) {
  puntsTornActual = parseInt(puntsTornActualGuardat, 10);
} else {
  puntsTornActual = 0;
}

	updateFinalitzarTornButton();
     // updateNumTiradaDisplay();

  // Si la partida ja estava començada, canviem el botó principal
  
  if (partidaIniciada) {

	const botoIniciarPantallaInici = document.getElementById("escena-pantallaInici-botoIniciarPartida");
if (botoIniciarPantallaInici) {
  if (partidaIniciada) {
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
	//document.getElementById("botoEliminarPartida").style.display = "flex";
  }else{
	document.getElementById("botoEliminarPartidaContainer").style.display = "none";
	//document.getElementById("botoEliminarPartida").style.display = "none";
  }
  
});

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
  localStorage.removeItem("partidaIniciada");
  localStorage.removeItem("estatDaus");
  localStorage.removeItem("numTirada");
  localStorage.removeItem("puntsTornActual");
  localStorage.removeItem('cartaActual');

  llistaJugadors = [];
  partidaIniciada = false;
  numTirada = 0;
  puntsTornActual = 0;
  
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

  if (localStorage.getItem("partidaIniciada") === "true") {
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
