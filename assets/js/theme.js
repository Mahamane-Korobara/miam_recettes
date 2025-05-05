/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */
"use strict";

/** @type {HTMLElement} */
const html = document.documentElement;

/** @type {boolean} */
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const stockage = sessionStorage.getItem('theme'); // Renvoie la valeur associee a la clef 'theme' ou null si elle n'existe pas au sein de sessionStorage
html.dataset.theme = stockage || (isDark ? 'dark' : 'light');

/** @type {boolean} */

let isPresser = false;

const changeTheme = function() {
    isPresser = isPresser ? false : true; // Inverse la valeur de isPresser
    // Si isPresser est vrai, on applique le theme sombre, sinon on applique le theme clair
    
    this.setAttribute('aria-pressed', isPresser); // Met a jour l'attribut aria-pressed de l'element
    html.dataset.theme = isPresser ? 'dark' : 'light'; // change le theme de la page

    sessionStorage.setItem('theme', html.dataset.theme); // enregistre le theme dans le sessionStorge
    // On enregistre le theme dans le sessionStorage pour qu'il soit conserve entre les rechargements de page
}

window.addEventListener('load', function() {

    const themeButton = document.querySelector('[data-theme-btn]')

    themeButton.addEventListener('click', changeTheme);
});