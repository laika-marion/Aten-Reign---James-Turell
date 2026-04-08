// 1. Fade de couleur automatique (ordre arc-en-ciel bref changez)
const couleurs = [
  "#7fb3c8", // bleu
  "#215b7e",
  "#062947",
  "#260531",
  "#481a80",
  "#C7B2FF", // violet
  "#EBC4FF",
  "#FFD2FF",
  "#FFDFFC",
  "#FFE7E8",
];

let indexCouleur = 0;

function changerCouleur() {
  indexCouleur = (indexCouleur + 1) % couleurs.length;
  document.body.style.backgroundColor = couleurs[indexCouleur];
}

// Change toutes les 3 secondes
setInterval(changerCouleur, 3000);

// 2. Les SVG

const ellipses = [
  `<img src="img/ellipse1.svg" alt="Ellipse 1"/>`,
  `<img src="img/ellipse2.svg" alt="Ellipse 2"/>`,
  `<img src="img/ellipse3.svg" alt="Ellipse 3"/>`,
  `<img src="img/ellipse4.svg" alt="Ellipse 4"/>`,
  `<img src="img/ellipse5.svg" alt="Ellipse 5"/>`,
];

let etat = 0; // 0 = aucun cercle, 1 à 5 = index du dernier cercle affiché
let cercle1 = null; // centre et rayon du premier cercle cliqué

// 3. Logique des clics
let compteur = 0;

const tailles = ["50vmin", "30vmin", "55vmin", "75vmin", "90vmin"];

function creerEllipse(svgTemplate, cx, cy, taille) {
  let conteneur = document.createElement("div");
  conteneur.className = "ellipse";
  conteneur.style.setProperty("--cx", cx + "px");
  conteneur.style.setProperty("--cy", cy + "px");
  conteneur.style.setProperty("--taille", taille); // ← taille variable
  conteneur.innerHTML = svgTemplate;
  document.body.prepend(conteneur);
  return conteneur;
}

function toutSupprimer() {
  document.querySelectorAll(".ellipse").forEach(function (el) {
    document.body.removeChild(el);
  });
}

function estDansCercle1(x, y) {
  if (cercle1 === null) return false;
  let dx = x - cercle1.cx;
  let dy = y - cercle1.cy;
  // Distance euclidienne au centre
  return Math.sqrt(dx * dx + dy * dy) <= cercle1.r;
}

document.addEventListener("click", function (event) {
  let x = event.clientX;
  let y = event.clientY;

  if (etat == 0) {
    // Aucun cercle → affiche ellipse 1 au point de clic
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  } else if (estDansCercle1(x, y) && etat < ellipses.length) {
    // Clic DANS le cercle et pas encore au max → ajoute le cercle suivant
    creerEllipse(ellipses[etat], cercle1.cx, cercle1.cy, tailles[etat]);
    etat++;
  } else {
    // Clic DEHORS (ou max atteint) → repart depuis ellipse 1 au point de clic
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  }
});
