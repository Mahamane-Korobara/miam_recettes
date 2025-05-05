/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";

/**
 * Import
 */

import {fetchData} from "./api.js";
// import { carteQueries, carteSquelette } from "./global.js";
import { getTime } from "./module.js"; 


//Affichage des donnée


const detailConteneur = document.querySelector("[data-detail-conteneur]");

const ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";
const APP_ID = "7d05b631";
const APP_KEY = "6478ae312c566df70854828805c4033d";

// Récupère l'ID de la recette depuis l'URL
const recipeId = window.location.search.split('=')[1];

if (recipeId) {
    // Construit l'URL correcte pour les détails d'une recette
    const url = `${ACCESS_POINT}/${recipeId}?app_id=${APP_ID}&app_key=${APP_KEY}&type=public`;
    
    console.log("URL de la requête:", url); // Affiche l'URL complète
    
    // Fait la requête directement sans utiliser fetchData
    fetch(url, {
        headers: {
            "Accept": "application/json",
            "Edamam-Account-User": APP_ID
        }
    })
    .then(response => {
        console.log("Statut de la réponse:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Données reçues:", data);

        
    const {
        images: {LARGE, REGULAR, SMALL, THUMBNAIL},
        label: title,
        source: author,
        ingredients = [],
        totalTime: cookingTime = 0,
        calories = 0,
        cuisineType = [],
        dietLabels = [],
        dishType = [],
        yield: serving = 0,
        ingredientLines = [],
        uri
    } = data.recipe;

    document.title = `${title} - Miam`;

    const banner = LARGE ?? REGULAR ?? SMALL ?? THUMBNAIL;
    const {

        url: bannerUrl,
        width,
        height
    } = banner;

    const tags = [...cuisineType, ...dietLabels, ...dishType];

    let tagElements = "";
    let ingredientItems = "";

    const recetteId = uri.slice(uri.lastIndexOf("_") + 1);
    const isSaved = window.localStorage.getItem(`recette-cuisine${recetteId}`);

    tags.map(tag => {

        let type = "";

        if(cuisineType.includes(tag)){
            type = "cuisineType";
        } else if (dietLabels.includes(tag)){
            type = "diet";
        } else {
            type = "dishType";
        }

        tagElements += `
            <a href="./recipes.html?${type}=${tag.toLowerCase()}" class="puce-filtre label-large etat">${tag}</a>
        
        `;
    });

    ingredientLines.map(ingredient => {
        ingredientItems += `
            <li class="ingr-item">
                ${ingredient}
            </li>
        `;
    });

    detailConteneur.innerHTML = `
        <figure class="detail-banner img-holder">
            <img src="${bannerUrl}" width="${width}" height="${height}" alt="${title}" class="img-cover">
        </figure>

        <div class="detail-contenu">

            <div class="titre-wrapper">
                <h1 class="display-small">${title ?? "Pas de titre"}</h1>

                <button class="btn btn-secondaire etat a-icon ${isSaved ? "saved" : "supprimer"}" onclick="saveRecipe(this, '${recetteId}')">
                    <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                    <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                    <span class="label-large save-text">Enregistré</span>
                    <span class="label-large unsaved-text">Retiré</span>
                </button>
            </div>

            <div class="detail-auteur label-large">
                <span class="span">par</span> ${author}
            </div>

            <div class="detail-stats">
                <div class="stats-item">
                    <span class="display-medium">${ingredients.length}</span>
                    <span class="label-medium">Ingredients</span>
                </div>

                <div class="stats-item">
                    <span class="display-medium">${getTime(cookingTime).temps || "<1"}</span>
                    <span class="label-medium">${getTime(cookingTime).uniteTemps}</span>
                </div>

                <div class="stats-item">
                    <span class="display-medium">${Math.floor(calories)}</span>
                    <span class="label-medium">calories</span>
                </div>
            </div>

            ${tagElements ? `<div class="tag-list"> ${tagElements}</div>` : ""}

            <h2 class="title-medium ingr-title">
                Ingrédients
                <span>Pour ${serving} personnes</span>
            </h2>

            ${ingredientItems ? `<ul class="body-large ingr-list">
              ${ingredientItems}
            </ul>` : ""}
        </div>
    `;
    })
    .catch(error => {
        console.error("Erreur complète:", error);
    });


} else {
    console.error("Aucun ID de recette trouvé dans l'URL");
}