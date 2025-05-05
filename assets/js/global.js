/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";

import { fetchData } from "./api.js";

/**Ajoute un écouteur d'événement à chaque élément d'une liste de nœuds.
 * 
 * @param {NodeList}  nodeList // dernierTabPanelActive et dernierTabBtnActive
 * @param {string} event // Type d'événement 
 * @param {function} callback // Fonction de rappel à exécuter lorsque l'événement se produit
 */

window.ajoutEvenement = (nodeList, event, callback) => {
   for(const element of nodeList) {
    element.addEventListener(event, callback)
   }
}

export const carteQueries = [
   ["field", "uri"],
   ["field", "label"],
   ["field", "image"],
   ["field", "totalTime"]

];


//Carte squelette

export const carteSquelette = `
   <div class="carte carte-squelette">

      <div class="squelette carte-banner"></div>

      <div class="carte-body">

         <div class="squelette carte-titre"></div>

         <div class="squelette carte-texte"></div>
      </div>
   </div>
`;

const ROOT = "https://api.edamam.com/api/recipes/v2";

window.saveRecipe = function (element, recetteId) {
   const isSaved = window.localStorage.getItem(`recette-cuisine${recetteId}`);

   ACCESS_POINT = `${ROOT}/${recetteId}`;

   if(!isSaved) {
      fetchData(carteQueries, function(data) {
         window.localStorage.setItem(`recette-cuisine${recetteId}`, JSON.stringify(data));
         element.classList.toggle("saved");
         element.classList.toggle("supprimer");
         montrerNotification("Recette ajoutée à votre liste de favoris !");

      });

      ACCESS_POINT = ROOT;

   } else {
      window.localStorage.removeItem(`recette-cuisine${recetteId}`);
      element.classList.toggle("saved");
      element.classList.toggle("supprimer");
      montrerNotification("Recette supprimée de votre liste de favoris !");
   }
}


const encasBarreConteneur = document.createElement("div");
encasBarreConteneur.classList.add("encasbarre-conteneur");
document.body.appendChild(encasBarreConteneur);

function montrerNotification(message) { 
   const encasBarre = document.createElement("div");
   encasBarre.classList.add("encasBarre");
   encasBarre.innerHTML = `<p class="body-medium">${message}</p>`;
   encasBarreConteneur.appendChild(encasBarre);
encasBarre.addEventListener("animationend", event => encasBarreConteneur.removeChild(encasBarre));
}