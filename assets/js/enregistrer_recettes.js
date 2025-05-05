/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";

/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";

/**
 * Importe
 */

import {fetchData} from "./api.js";
// import { carteQueries, carteSquelette } from "./global.js";
import { getTime } from "./module.js"; 


const enregistreRecettes = Object.keys(window.localStorage).filter(item => {
    return item.startsWith("recette-cuisine");
    
});

// console.log(enregistreRecettes);

const enregistreRecetteConteneur = document.querySelector("[data-enregistrer-recette-conteneur]");

enregistreRecetteConteneur.innerHTML = `
    <h2 class="headline-small section-titre">Tout les recettes enregistrer</h2>

`;

const gridList = document.createElement("div");
gridList.classList.add("grid-list");

if(enregistreRecettes.length) {
    enregistreRecettes.map((enregistreRecette, index) => {

        const {

            recipe: {
                image,
                label: title,
                totalTime: cookingTime,
                uri
            }
        } = JSON.parse(window.localStorage.getItem(enregistreRecette));

        // console.log(JSON.parse(window.localStorage.getItem(enregistreRecette)));


        const recetteId = uri.slice(uri.lastIndexOf("_") + 1); // Extraction de l'ID de la recette

                const isSaved = window.localStorage.getItem(`recette-cuisine${recetteId}`); // Vérification si la recette est enregistrée

                const carte = document.createElement("div");
                carte.classList.add("carte");
                carte.style.animationDelay = `${100 + index}ms`;

                //Ajout de la carte 

                carte.innerHTML = `
                    <figure class="carte-media img-holder">

                        <img src="${image}" width="105" height="105" loading="lazy" alt="${title}" class="img-cover">
                    </figure>

                    <div class="carte-body">

                        <h3 class="petit-titre">
                            <a href="./detail.html?recipe=${recetteId}" class="carte-lien">${title ?? "Pas de titre"}</a>
                        </h3>

                        <div class="meta-wrapper">

                            <div class="meta-item">
                                <span class="material-symbols-outlined" aria-hidden="true">schedule</span>

                                <span class="label-medium">${getTime(cookingTime).temps || "<1"} ${getTime(cookingTime).uniteTemps}</span>
                            </div>

                            <button class="icon-btn etat ${isSaved ? "saved" : "supprimer"}" aria-label="Ajouter aux recettes enregistrées" onclick="saveRecipe(this, '${recetteId}')">
                                <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                                <span class="material-symbols-outlined bookmark">bookmark</span>
                            </button>
                        </div>
                    </div>`;

                // Ajout de l'élément carte à la liste
                gridList.appendChild(carte);
    });
} else {
    enregistreRecetteConteneur.innerHTML += `<p class="body-large">Vous n'avez pas encore enregistré de recettes !</p>`;
}

enregistreRecetteConteneur.appendChild(gridList);
