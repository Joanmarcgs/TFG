const CACHE_NAME = 'illa-calavera-v11';
const ASSETS = [
	'index.html',
	'style.css',
	'main.js',
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
  // ...i la resta d’assets que vulguis offline
];

self.addEventListener('install', evt => {
  // 1) Pre-cachejar tots els recursos
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
  // 2) Skip waiting: passa directament a l'estat "activated"
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  // 3) Netejar versions antigues de cache
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(oldKey => caches.delete(oldKey))
      )
    )
  );
  // 4) Clients.claim: pren control immediat de totes les pestanyes obertes
  clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(res => res || fetch(evt.request))
  );
});