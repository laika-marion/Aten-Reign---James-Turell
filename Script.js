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
const sonAmbiance = new Audio("sound/ambiance.mp3");
sonAmbiance.loop = true;

const sonInterieur = new Audio("sound/interieur.mp3");
const sonExterieur = new Audio("sound/an.mp3");
const sonLongClic = new Audio("sound/ad.mp3"); // déclenché dès qu'un long clic est détecté
const sonDisparition = new Audio("sound/d.mp3"); // déclenché quand les cercles disparaissent

// index de la couleur actuellement affichée dans le tableau couleurs
let indexCouleur = 0;

let vitesseCouleur = 3000;

// opacité des ellipses, modifiable avec les flèches gauche/droite (entre 0 et 1)
const OPACITE_MIN = 0.05;
const OPACITE_MAX = 0.8;
const OPACITE_PAS = 0.05;
let opaciteEllipses = 0.5; // valeur initiale = fin naturelle de l'animation pop

// 0 = aucun cercle affiché
let etat = 0;

// mémorise le centre et le rayon du premier cercle cliqué (cx,cy) ou null si aucun cercle présent
let cercle1 = null;

// 5. VARIABLES CLIC LONG / ROTATION -------------------------------------------------------------------

const SEUIL_LONG_CLIC = 200; // ms : en dessous = clic court, au-dessus = clic long
const CONTRAINTE_ROTATION = 15; // plus la valeur est grande, plus la rotation est douce

let longClickTimer = null;
let isLongClick = false; // true dès que le seuil est dépassé
let isMoving = false; // true pendant le drag du clic long
let bloquerProchainClic = false; // empêche le "click" natif qui suit un mouseup long

// 2. FONCTIONS DE BASE -------------------------------------------------------------------------------

function creerEllipse(svgTemplate, cx, cy, taille) {
  let conteneur = document.createElement("div");
  conteneur.className = "ellipse";
  conteneur.style.setProperty("--cx", cx + "px");
  conteneur.style.setProperty("--cy", cy + "px");
  conteneur.style.setProperty("--taille", taille);
  conteneur.innerHTML = svgTemplate;
  document.body.prepend(conteneur);

  // une fois l'animation terminée, on retire "forwards" et on fixe l'opacité courante
  conteneur.addEventListener(
    "animationend",
    () => {
      conteneur.classList.add("animee");
      conteneur.style.opacity = opaciteEllipses;
    },
    { once: true },
  );

  return conteneur;
}

function toutSupprimer() {
  let ellipsesPresentes = document.querySelectorAll(".ellipse");
  if (ellipsesPresentes.length > 0) {
    jouerSon(sonDisparition); // son D déclenché à chaque fois que des cercles disparaissent
  }
  ellipsesPresentes.forEach(function (el) {
    document.body.removeChild(el);
  });
}

function estDansCercle1(x, y) {
  if (cercle1 == null) return false;
  let dx = x - cercle1.cx;
  let dy = y - cercle1.cy;
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

// remet toutes les ellipses à plat avec une transition douce
function reinitialiserRotation() {
  document.querySelectorAll(".ellipse").forEach((el) => {
    el.style.transition = "transform 0.4s ease";
    el.style.transform = "rotateX(0deg) rotateY(0deg)";
    setTimeout(() => {
      el.style.transition = "";
    }, 400);
  });
}

// applique opaciteEllipses à toutes les ellipses présentes et joue le son D aux limites
function appliquerOpacite() {
  let atteintLimite =
    opaciteEllipses <= OPACITE_MIN || opaciteEllipses >= OPACITE_MAX;
  document.querySelectorAll(".ellipse.animee").forEach((el) => {
    el.style.opacity = opaciteEllipses;
  });
  if (atteintLimite) {
    jouerSon(sonDisparition);
  }
}

// 3. INITIALISATION ------------------------------------------------------------------------------------
window.addEventListener("load", function () {
  console.log("La page est complètement chargée");
  setInterval(changerCouleur, vitesseCouleur);
});

// 4. EVENTS  -------------------------------------------------------- -----------------------------------

document.addEventListener(
  "keydown",
  function (event) {
    cacherToutSaufEllipses();
    if (event.preventDefaulted) return;

    switch (event.code) {
      case "ArrowLeft":
        opaciteEllipses = Math.max(
          OPACITE_MIN,
          parseFloat((opaciteEllipses - OPACITE_PAS).toFixed(2)),
        );
        appliquerOpacite();
        break;
      case "ArrowRight":
        opaciteEllipses = Math.min(
          OPACITE_MAX,
          parseFloat((opaciteEllipses + OPACITE_PAS).toFixed(2)),
        );
        appliquerOpacite();
        break;
    }
    console.log("opacité ellipses :", opaciteEllipses);
    event.preventDefault();
  },
  true,
);

// --- CLIC LONG : détection au mousedown ---
document.addEventListener("mousedown", function () {
  isLongClick = false;

  longClickTimer = setTimeout(() => {
    isLongClick = true;
    isMoving = true;
    jouerSon(sonLongClic); // son AD joué dès que le seuil du long clic est atteint
  }, SEUIL_LONG_CLIC);
});

// --- CLIC LONG : rotation au mousemove ---
document.addEventListener("mousemove", function (event) {
  if (!isMoving || !cercle1) return;

  let dx = event.clientX - cercle1.cx;
  let dy = event.clientY - cercle1.cy;
  let calcX = -dy / CONTRAINTE_ROTATION;
  let calcY = dx / CONTRAINTE_ROTATION;

  // applique la rotation sur TOUTES les ellipses
  document.querySelectorAll(".ellipse").forEach((el) => {
    el.style.transform = "rotateX(" + calcX + "deg) rotateY(" + calcY + "deg)";
  });
});

// --- CLIC LONG : fin au mouseup ---
window.addEventListener("mouseup", function () {
  clearTimeout(longClickTimer);

  if (isLongClick) {
    isMoving = false;
    isLongClick = false;
    reinitialiserRotation();
    // bloque le "click" natif qui se déclenche automatiquement après le mouseup
    bloquerProchainClic = true;
  }

  isMoving = false;
});

// --- CLIC COURT : logique des ellipses ---
document.addEventListener("click", function (event) {
  // si le mouseup vient de signaler un clic long, on ignore ce "click"
  if (bloquerProchainClic) {
    bloquerProchainClic = false;
    return;
  }

  cacherToutSaufEllipses();

  let x = event.clientX;
  let y = event.clientY;

  if (etat == 0) {
    jouerSon(sonExterieur);
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  } else if (estDansCercle1(x, y) && etat < ellipses.length) {
    jouerSon(sonInterieur);
    creerEllipse(ellipses[etat], cercle1.cx, cercle1.cy, tailles[etat]);
    etat++;
  } else {
    jouerSon(sonExterieur);
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  }
});
