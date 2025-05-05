/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";

/**
 * Importe
 */

import {fetchData} from "./api.js";
import { carteQueries, carteSquelette } from "./global.js";
import { getTime } from "./module.js";  

const APP_ID = "7d05b631";


/**
 * Accordion
 */

const accordions = document.querySelectorAll("[data-accordion]");


/**
 * 
 * @param {NodeList} element 
 */
const initialAccordion = function(element) {
    const buton = element.querySelector("[data-accordion-btn]");

    let isExpanded = false;

    buton.addEventListener("click", function() {

        isExpanded = isExpanded ? false : true;
        this.setAttribute("aria-expanded", isExpanded);
    });
}

for(const accordion of accordions) initialAccordion(accordion);


/**
 * Filtre barre toggle pour les mobiles 
 */

const filtreBarre = document.querySelector("[data-filtre-barre]");

const filtreToggles = document.querySelectorAll("[data-filtre-toggle]");

const overlay = document.querySelector("[data-overlay]");


ajoutEvenement(filtreToggles, "click", function() {

    filtreBarre.classList.toggle("active");
    overlay.classList.toggle("active");

    const bodyDebordement = document.body.style.overflow;
    document.body.style.overflow = bodyDebordement === "hidden" ?  "visible" : "hidden";
});


/**
 * Filter soumet ou effacer
 */

const filtreSoumet = document.querySelector("[data-filtre-submit]");
const filtreEffacer = document.querySelector("[data-filtre-effacer]");
const filtreRecherche = document.querySelector("input[type='search']");

filtreSoumet.addEventListener("click", function() {

    const filtreCheckboxes = document.querySelectorAll("input:checked");

    const queries = [];

    if(filtreRecherche.value) queries.push(["q", filtreRecherche.value]);

    if(filtreCheckboxes.length) {
        for(const checkbox of filtreCheckboxes) {
            const clé = checkbox.parentElement.parentElement.dataset.filter;
            queries.push([clé, checkbox.value]);
        }
    }

    console.log(queries)
    // console.log(queries.join("&").replace(/,/g, "="));
    window.location = queries.length ? `?${queries.join("&").replace(/,/g, "=")}` : "/recipes.html";
});

filtreRecherche.addEventListener("keydown", e =>{
    if(e.key === "Enter") {
        filtreSoumet.click();
        console.log("ok");
    }
});

filtreEffacer.addEventListener("click", function() {
    const filtreCheckboxes = document.querySelectorAll("input:checked");

    filtreCheckboxes?.forEach(element => element.checked = false);
    filtreRecherche.value = "";
});

const queryStr = window.location.search.slice(1);
const queries = queryStr && queryStr.split("&").map(i => i.split("="));

const filtreCompte = document.querySelector("[data-filtre-compte]");

if(queries.length) {
    filtreCompte.style.display = "block";
    filtreCompte.innerHTML = queries.length;
} else {
    filtreCompte.style.display = "none";
}

console.log(queries);

queryStr && queryStr.split("&").map(i => {

    if(i.split("=")[0] === "q") {
        filtreBarre.querySelector("input[type='search']").value = i.split("=")[1].replace(/%20/g, " ");
    } else {
        filtreBarre.querySelector(`[value='${i.split("=")[1].replace(/%20/g, " ")}']`).checked = true;
    }
});

const filtreBtn = document.querySelector("[data-filtre-btn]");

window.addEventListener("scroll", event => {

    filtreBtn.classList[window.scrollY >= 128 ? "add" : "remove"]("active");
});


/**
 * * Affiche les recettes
 */


const gridListe = document.querySelector("[data-grid-list]");
const monterPlus = document.querySelector("[data-monter-plus]");

const queriesDefaut = [
    ["mealType", "breakfast"],
    ["mealtype", "dinner"],
    ["mealtype", "lunch"],
    ["mealtype", "snack"],
    ["mealtype", "teatime"],
    ...carteQueries
];

gridListe.innerHTML = carteSquelette.repeat(20);
/**Chaine de caractere */
let pageSuivantUrl = "";

const demandeRecettes = (data, isInitialLoad = false) => {
    // Utilisation d'un fragment pour améliorer les performances
    const fragment = document.createDocumentFragment();
    let currentIndex = isInitialLoad ? 0 : gridListe.children.length;

    // Création d'un tableau de promesses pour le préchargement des images
    const imagePromises = data.hits.map(item => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.src = item.recipe.image;
        });
    });

    // Traitement par lots pour éviter de bloquer le thread principal
    const batchSize = 3;
    const processRecipes = async (startIndex) => {
        const endIndex = Math.min(startIndex + batchSize, data.hits.length);
        const batch = data.hits.slice(startIndex, endIndex);

        batch.forEach((item, index) => {
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
            const animationDelay = `${100 * (currentIndex + startIndex + index)}ms`;

            const li = document.createElement('li');
            li.className = 'curseur-item';
            li.style.animationDelay = animationDelay;
            li.innerHTML = `
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
            `;
            fragment.appendChild(li);
        });

        if (isInitialLoad && startIndex === 0) {
            gridListe.innerHTML = '';
        }
        
        // Attendre que les images soient chargées avant d'ajouter au DOM
        await Promise.all(imagePromises.slice(startIndex, endIndex));
        gridListe.appendChild(fragment);

        // Traiter le lot suivant si nécessaire
        if (endIndex < data.hits.length) {
            setTimeout(() => processRecipes(endIndex), 100);
        }
    };

    // Démarrer le traitement par lots
    processRecipes(0);
};

let requetteAvant = true;

fetchData(queries || queriesDefaut, data => {
    // console.log(data);

    const { _links: { next }} = data;
    pageSuivantUrl = next?.href;

    gridListe.innerHTML = "";
    requetteAvant = false;

    if(data.hits.length) {
        demandeRecettes(data);
    } else {
        monterPlus.innerHTML = `
            <p class="body-medium info-texte">
                Aucune recette trouvée avec ces critères de recherche.
            </p>
        `;
    }
});


const conteneur_max_width = 1200;
const conteneur_max_carte = 6;

let estEnChargement = false;
let dernierScrollPosition = 0;

// Modifiez la partie de chargement infini
window.addEventListener("scroll", async () => {
    const scrollActuel = window.scrollY;
    const hauteurPage = document.documentElement.scrollHeight;
    const hauteurVue = window.innerHeight;
    
    // Vérifie si l'utilisateur a scrollé vers le bas et est près du bas de la page
    if (!estEnChargement && 
        scrollActuel > dernierScrollPosition && 
        scrollActuel + hauteurVue >= hauteurPage - 800 && 
        !requetteAvant && 
        pageSuivantUrl) {
        
        estEnChargement = true;
        monterPlus.innerHTML = carteSquelette.repeat(conteneur_max_carte);
        requetteAvant = true;

        try {
            // Attendre un peu pour éviter les chargements trop rapides
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const response = await fetch(pageSuivantUrl, {
                headers: {
                    "Accept": "application/json",
                    "Edamam-Account-User": APP_ID
                }
            });

            if (!response.ok) throw new Error(`Erreur ${response.status}`);

            const data = await response.json();
            pageSuivantUrl = data._links?.next?.href || null;
            
            if (data.hits?.length) {
                // Charger seulement un nombre limité d'éléments à la fois
                const elementsACharger = Math.min(data.hits.length, conteneur_max_carte);
                const donneesLimitees = {
                    ...data,
                    hits: data.hits.slice(0, elementsACharger)
                };
                demandeRecettes(donneesLimitees);
            } else {
                monterPlus.innerHTML = `<p class="info-texte">Fin des résultats</p>`;
                pageSuivantUrl = null;
            }
        } catch (error) {
            console.error("Erreur pagination:", error);
            monterPlus.innerHTML = `
                <p class="error-text">Erreur de chargement</p>
                <button onclick="window.location.reload()">Réessayer</button>
            `;
            pageSuivantUrl = null;
        } finally {
            requetteAvant = false;
            estEnChargement = false;
        }
    }
    
    dernierScrollPosition = scrollActuel;
});


