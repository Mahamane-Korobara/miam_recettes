/**
 * @author Mahamane-Korobara <korobaramahamane@gmail.com>
 */

"use strict";


/**
 * 
 * @param {Number} minute // Temps de cuisson en minutes
 * @returns string // Temps formaté avec l'unité appropriée
 */
export const getTime = minute => {
    const heures = Math.floor(minute / 60);
    const jour = Math.floor(heures / 24);

    const temps = jour || heures || minute;
    const uniteIndex = [jour, heures, minute].lastIndexOf(temps);
    const uniteTemps = ["jour", "heures", "minutes"][uniteIndex];

    return { temps, uniteTemps };
}