/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";

// Import

import {fetchData} from "./api.js";
import { carteQueries, carteSquelette } from "./global.js";
import { getTime } from "./module.js";  

const champRecherche = document.querySelector("[data-recherche-champ]");
const boutonRecherche = document.querySelector("[data-recherche-btn]");

boutonRecherche.addEventListener("click", function() {

    if(champRecherche.value) window.location = `recipes.html?q=${champRecherche.value}`;
});

//Rechecher avec la touche Entrée

champRecherche.addEventListener('keydown', e => {
    if(e.key === "Enter") boutonRecherche.click()
});

 // Panel navigation

 const tabBtns = document.querySelectorAll("[data-tab-btn]");
 const tabPanels = document.querySelectorAll("[data-tab-panel]");

 // Initialiser avec le premier élément actif
 //système d'onglets accessible, permettant à l'utilisateur de naviguer entre différentes sections de contenu. Lorsqu'un onglet est cliqué
 let dernierTabPanelActive = tabPanels[0];  // Prendre le premier panel
 let dernierTabBtnActive = tabBtns[0];      // Prendre le premier bouton

 ajoutEvenement(tabBtns, "click", function() {
    dernierTabPanelActive.setAttribute("hidden", ""); // Masquer le panel actif precedent
    dernierTabBtnActive.setAttribute("aria-selected", "false"); // Le bouton est desélectionné
    dernierTabBtnActive.setAttribute("tabindex", "-1"); //Retrait de l'ordre de tabulation


    const tabPanelActuelle = document.querySelector(`#${this.getAttribute("aria-controls")}`); //fait reference au btn sur lequel user a cliqué qui a l'attribut aria-controls qui correspond à l'id du panel
    tabPanelActuelle.removeAttribute("hidden"); //Le nouveau panneau associé à l'onglet cliqué est affiché en supprimant l'attribut hidden
    this.setAttribute("aria-selected", "true");
    this.setAttribute("tabindex", "0");

    dernierTabPanelActive = tabPanelActuelle;
    dernierTabBtnActive = this; 

    ajoutContenuTab(this, tabPanelActuelle); //Appel de la fonction pour ajouter le contenu au panneau actif

});

/**
 * Onglet de navigation pour les recettes
 */


ajoutEvenement(tabBtns, "keydown", function(event) {

    const elementSuivant = this.nextElementSibling;
    const elementPrecedent = this.previousElementSibling;

    if(event.key === "ArrowRight" && elementSuivant) {
        this.setAttribute("tabindex", -1);
        elementSuivant.setAttribute("tabindex", 0);
        elementSuivant.focus();
    } else if(event.key === "ArrowLeft" && elementPrecedent) {
        this.setAttribute("tabindex", -1);
        elementPrecedent.setAttribute("tabindex", 0);
        elementPrecedent.focus();
    } else if(event.key === "tab") {
        this.setAttribute("tabindex", -1);
        dernierTabBtnActive.setAttribute("tabindex", 0);
        dernierTabBtnActive.focus()
    }
});


/**
 * Travail avec l'API Edamam
 * fetch data pour le conteneur tap
 */

const ajoutContenuTab = (tabBtnActuelle, tabPanelActuelle) => {

    const gridList = document.createElement("div");
    gridList.classList.add("grid-list");

    // AjouttabPanelActuer le squelette pendant le chargement
    tabPanelActuelle.innerHTML = `
        <div class="grid-list">
            ${carteSquelette.repeat(12)}
        </div>
    `; 

    // 1. Déclaration de la map pour la conversion des types de repas
    const frenchToMealType = {
        "Pétit-dej": "Breakfast",
        "Déjeuner":   "Lunch",
        "Dîner":      "Dinner",
        "En-cas":  "Snack",
        "Thé-time":   "Teatime"
    };

    // Construire les paramètre de requête
    const labelFr = tabBtnActuelle.textContent.trim();
    const mealTypeEn = frenchToMealType[labelFr];
    
    if (!mealTypeEn) {
      console.warn(`Label inconnu pour mealType : ${labelFr}`);
      return;
    }
    
    const queries = [
      ['mealType', mealTypeEn.toLowerCase()]  // ou en majuscule si nécessaire
    ]; 
    
    // Appel à l'API 
    fetchData(queries, function(data) {
        if (data) {
            console.log('Données reçues:', data);
            tabPanelActuelle.innerHTML = ""; // Vider le contenu du panel avant d'ajouter les nouvelles cartes

            for(let i = 0; i < 12; i++) {
                const {
                    recipe: {
                        image,
                        label: title,
                        totalTime: cookingTime,
                        uri
                    }
                } = data.hits[i]; // Destructuration de l'objet recipe

                const recetteId = uri.slice(uri.lastIndexOf("_") + 1); // Extraction de l'ID de la recette

                const isSaved = window.localStorage.getItem(`recette-cuisine${recetteId}`); // Vérification si la recette est enregistrée

                const carte = document.createElement("div");
                carte.classList.add("carte");
                carte.style.animationDelay = `${100 + i}ms`;

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
            }

            tabPanelActuelle.appendChild(gridList); // Ajout de la liste au panneau actif
            tabPanelActuelle.innerHTML += `
                <a href="./recipes.html?mealType=${mealTypeEn.toLowerCase()}" class="btn btn-secondaire label-large etat">Montrer plus</a>
            `;
        } else {
            console.error('Format de données incorrect:', data);
            
        }

    });
}

ajoutContenuTab(dernierTabBtnActive, dernierTabPanelActive);


/**
 * fetchData pour curseurs carte
 */

// 1) Votre objet de traduction
const cuisineType = {
    "Asian":  "Asiatiques",
    "French": "Françaises"
};
  
const curseurSections = document.querySelectorAll("[data-curseur-section]");
const cuisineValues = Object.values(cuisineType);
const cuisineKeys = Object.keys(cuisineType);
  
for (const [index, curseurSection] of curseurSections.entries()) {
    const label = cuisineValues[index]; 
    const key = cuisineKeys[index];
  
    curseurSection.innerHTML = `
      <div class="conteneur">
        <h2 class="section-titre headline-small">
          Dernières recettes ${label}
        </h2>
        <div class="curseur">
          <ul class="curseur-wrapper" data-curseur-wrapper>
            ${ `<li class="curseur-item">${carteSquelette}</li>`.repeat(10) }
          </ul>
        </div>
      </div>
    `;

    const curseurWrapper = curseurSection.querySelector("[data-curseur-wrapper]");

    fetchData([...carteQueries, ["cuisineType", key]], function(data) {
        if (!data || !data.hits || !data.hits.length) {
            console.log(`Pas de données pour ${label}`);
            return;
        }

        let cartesHTML = "";
        
        data.hits.forEach(item => {
            const {
                recipe: {
                    image,
                    label: title,
                    totalTime: cookingTime,
                    uri
                }
            } = item;

            const recetteId = uri.slice(uri.lastIndexOf("_") + 1);
            const isSaved = window.localStorage.getItem(`recette-cuisine${recetteId}`);

            cartesHTML += `
                <li class="curseur-item">
                    <div class="carte">
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
                        </div>
                    </div>
                </li>
            `;
        });

        // Ajouter le bouton "Montrer plus" à la fin
        cartesHTML += `
            <li class="curseur-item" data-curseur-item>
                <a href="./recipes.html?cuisineType=${key.toLowerCase()}" class="charger-plus-de-cartes etat">
                    <span class="label-large">Montrer plus</span>
                    <span class="material-symbols-outlined" aria-hidden="true">navigate_next</span>
                </a>
            </li>
        `;

        curseurWrapper.innerHTML = cartesHTML;
    });
}
