// 1. Fade de couleur automatique
const couleurs = [
  "#7fb3c8",
  "#215b7e",
  "#062947",
  "#260531",
  "#481a80",
  "#C7B2FF",
  "#EBC4FF",
  "#FFD2FF",
  "#FFDFFC",
  "#FFE7E8",
];

let indexCouleur = 0;
let vitesseCouleur = 3000;
let body;

window.addEventListener("load", (event) => {
  console.log("La page est complètement chargée");
  body = document.getElementById("bodytest");
  console.log(body);
});



document.addEventListener(
  "keydown",
  function (event) {
    cacherToutSaufEllipses();
    if (event.preventDefaulted) {
      return; // Do nothing if event already handled
    }

    switch (event.code) {
      case "ArrowLeft":
        // Handle "turn left"
        vitesseCouleur-=100;
        break;
      case "ArrowRight":
        // Handle "turn right"
        vitesseCouleur+=100;
        break;
    }
    console.log(vitesseCouleur);
    // Consume the event so it doesn't get handled twice
    event.preventDefault();
  },
  true,
);

function changerCouleur() {
  indexCouleur = (indexCouleur + 1) % couleurs.length;
  document.body.style.transitionDuration = vitesseCouleur/2000+ "s"; 
  document.body.style.backgroundColor = couleurs[indexCouleur];
}

setInterval(changerCouleur, vitesseCouleur);


// 2. Les SVG
const ellipses = [
  `<img src="img/ellipse1.svg" alt="Ellipse 1"/>`,
  `<img src="img/ellipse2.svg" alt="Ellipse 2"/>`,
  `<img src="img/ellipse3.svg" alt="Ellipse 3"/>`,
  `<img src="img/ellipse4.svg" alt="Ellipse 4"/>`,
  `<img src="img/ellipse5.svg" alt="Ellipse 5"/>`,
  `<img src="img/triangle.svg" alt="triangle"/>`
];

let etat = 0;
let cercle1 = null;


// 3. Logique des clics
let compteur = 0;

const tailles = ["50vmin", "30vmin", "55vmin", "75vmin", "90vmin"];

function creerEllipse(svgTemplate, cx, cy, taille) {
  let conteneur = document.createElement("div");
  conteneur.className = "ellipse";
  conteneur.style.setProperty("--cx", cx + "px");
  conteneur.style.setProperty("--cy", cy + "px");
  conteneur.style.setProperty("--taille", taille);
  conteneur.innerHTML = svgTemplate;
  document.body.prepend(conteneur);
  return conteneur;
}

function toutSupprimer() {
  document.querySelectorAll(".ellipse").forEach(function(el) {
    document.body.removeChild(el);
  });
}

function estDansCercle1(x, y) {
  if (cercle1 === null) return false;
  let dx = x - cercle1.cx;
  let dy = y - cercle1.cy;
  return Math.sqrt(dx * dx + dy * dy) <= cercle1.r;
}


// 🔥 AJOUT ICI : cacher tout sauf les ellipses
function cacherToutSaufEllipses() {
  document.querySelectorAll("body > *:not(.ellipse)").forEach(el => {
    el.style.display = "none";
  });
}


document.addEventListener("click", function(event) {

  cacherToutSaufEllipses(); // 👈 AJOUT

  let x = event.clientX;
  let y = event.clientY;

  if (etat === 0) {
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.10;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;

  } else if (estDansCercle1(x, y) && etat < ellipses.length) {
    creerEllipse(ellipses[etat], cercle1.cx, cercle1.cy, tailles[etat]);
    etat++;

  } else {
    toutSupprimer();
    creerEllipse(ellipses[0], x, y, tailles[0]);
    let r = Math.min(window.innerWidth, window.innerHeight) * 0.10;
    cercle1 = { cx: x, cy: y, r: r };
    etat = 1;
  }
});
