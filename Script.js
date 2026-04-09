// 1. VARIABLES GLOBALES -----------------------------------------------------------------------

const couleurs = [
  "#750025",
  "#ac0048",
  "#27003f",
  "#201452",
  "#252f80",
  "#003c8a",
  "#0695c9",
  "#1d5560",
  "#00092e",
  "#140101",
];

// ellipses svg et tailles associées
const ellipses = [
  `<img src="img/ellipse1.svg" alt="Ellipse 1"/>`,
  `<img src="img/ellipse2.svg" alt="Ellipse 2"/>`,
  `<img src="img/ellipse3.svg" alt="Ellipse 3"/>`,
  `<img src="img/ellipse4.svg" alt="Ellipse 4"/>`,
  `<img src="img/ellipse5.svg" alt="Ellipse 5"/>`,
];

const tailles = ["200vmin", "80vmin", "100vmin", "120vmin", "140vmin"];

// sons de l'expérience
const sonAmbiance = new Audio("sound/ambiance.mp3"); // démarre au 1er clic
sonAmbiance.loop = true;

const sonInterieur = new Audio("sound/interieur.mp3"); // clic dans le cercle

const sonExterieur = new Audio("sound/exterieur.mp3"); // clic hors du cercle

// index de la couleur actuellement affichée dans le tableau couleurs
let indexCouleur = 0;

// modifiable avec les flèches gauche/droite du clavier
let vitesseCouleur = 3000;

// 0 = aucun cercle affiché
let etat = 0;

// mémorise le centre et le rayon du premier cercle cliqué (cx,cy) ou null si aucun cercle présent
let cercle1 = null;

// 2. FONCTIONS DE BASE -------------------------------------------------------------------------------

// crée et insère une ellipse à la position (cx,cy) avec la taille donnée
function creerEllipse(svgTemplate, cx, cy, taille) {
  let conteneur = document.createElement("div");
  conteneur.className = "ellipse";
  conteneur.style.setProperty("--cx", cx + "px");
  conteneur.style.setProperty("--cy", cy + "px");
  conteneur.style.setProperty("--taille", taille);
  conteneur.innerHTML = svgTemplate;
  // utilise prepend au lieu d'append pour que les nouveaux cercles s'ajoutent EN DESSOUS des précédents visuellement
  document.body.prepend(conteneur);
  return conteneur;
}

function toutSupprimer() {
  document.querySelectorAll(".ellipse").forEach(function (el) {
    document.body.removeChild(el);
  });
}

// est-ce que mon nouveau clic est tombé À L'INTÉRIEUR du cercle ou À L'EXTÉRIEUR ?"
function estDansCercle1(x, y) {
  if (cercle1 == null) return false;
  let dx = x - cercle1.cx;
  let dy = y - cercle1.cy;
  // Théorème de Pythagore : on calcule la distance réelle en pixels entre le nouveau clic et le centre du cercle
  // si cette distance est inférieure ou égale au rayon (cercle1.r)
  // -> le clic est À L'INTÉRIEUR le cercle donc on répond true
  // Sinon le clic est À L'EXTÉRIEUR donc on répond false
  return Math.sqrt(dx * dx + dy * dy) <= cercle1.r;
}

function cacherToutSaufEllipses() {
  if (sonAmbiance.paused) {
    sonAmbiance.play();
  }
  document.querySelectorAll("body > *:not(.ellipse)").forEach((el) => {
    el.style.display = "none";
  });
}

function changerCouleur() {
  indexCouleur = (indexCouleur + 1) % couleurs.length;
  document.body.style.transitionDuration = vitesseCouleur / 2000 + "s";
  document.body.style.backgroundColor = couleurs[indexCouleur];
}

function jouerSon(son) {
  son.currentTime = 0;
  son.play();
}

// 3. INITIALISATION ------------------------------------------------------------------------------------
window.addEventListener("load", function () {
  console.log("La page est complètement chargée");
  setInterval(changerCouleur, vitesseCouleur);
});

// 4. EVENTS  -------------------------------------------------------------------------------------------

document.addEventListener(
  "keydown",
  function (event) {
    cacherToutSaufEllipses();
    if (event.preventDefaulted) return;

    switch (event.code) {
      case "ArrowLeft":
        // flèche gauche : accélère
        vitesseCouleur -= 100;
        break;
      case "ArrowRight":
        // flèche droite : ralentit
        vitesseCouleur += 100;
        break;
    }
    console.log(vitesseCouleur);
    event.preventDefault();
  },
  true,
);

// gère toute la logique des clics selon l'état des cercles de l'expérience
document.addEventListener("click", function (event) {
  cacherToutSaufEllipses();

  let x = event.clientX;
  let y = event.clientY;

  if (etat == 0) {
    // aucun cercle -> affiche ellipse 1 + son extérieur
    jouerSon(sonExterieur);
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  } else if (estDansCercle1(x, y) && etat < ellipses.length) {
    // clic DEDANS -> son intérieur + autre ellipse(s) jusqu'à la 5ème
    jouerSon(sonInterieur);
    creerEllipse(ellipses[etat], cercle1.cx, cercle1.cy, tailles[etat]);
    etat++;
  } else {
    // clic DEHORS -> son extérieur
    jouerSon(sonExterieur);
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  }
});
