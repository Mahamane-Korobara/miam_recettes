/**
 * Module de traduction utilisant Google Translate API
 */

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyB8voHvNWpSRgbk55NcuKo0BPiA4xYrLWY';

// Cache pour stocker les traductions déjà effectuées
const translationCache = new Map();

/**
 * Détecte la langue d'un texte
 * @param {string} text - Texte à analyser
 * @returns {Promise<string>} Code de la langue (fr, en, etc.)
 */
export async function detectLanguage(text) {
    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text })
        });
        
        const data = await response.json();
        return data.data.detections[0][0].language;
    } catch (error) {
        console.error('Erreur de détection de langue:', error);
        return 'fr'; // Par défaut en français
    }
}

/**
 * Traduit un texte
 * @param {string} text - Texte à traduire
 * @param {string} targetLang - Langue cible
 * @param {string} sourceLang - Langue source (optionnelle)
 * @returns {Promise<string>} Texte traduit
 */
export async function translateText(text, targetLang, sourceLang = null) {
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    
    // Vérifie si la traduction est en cache
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                ...(sourceLang && { source: sourceLang })
            })
        });
        
        const data = await response.json();
        const translation = data.data.translations[0].translatedText;
        
        // Stocke la traduction dans le cache
        translationCache.set(cacheKey, translation);
        
        return translation;
    } catch (error) {
        console.error('Erreur de traduction:', error);
        return text;
    }
}

/**
 * Traduit les résultats de recettes
 * @param {Object} recipeData - Données de recettes à traduire
 * @returns {Promise<Object>} Données traduites
 */
export async function translateRecipeResults(recipeData) {
    if (!recipeData?.hits) return recipeData;

    const translatedHits = await Promise.all(recipeData.hits.map(async (hit) => {
        const recipe = hit.recipe;
        const translatedRecipe = {
            ...recipe,
            label: await translateText(recipe.label, 'fr', 'en'),
            ingredientLines: await Promise.all(
                recipe.ingredientLines.map(ingredient => 
                    translateText(ingredient, 'fr', 'en')
                )
            ),
            dishType: await Promise.all(
                (recipe.dishType || []).map(type => 
                    translateText(type, 'fr', 'en')
                )
            ),
            cuisineType: await Promise.all(
                (recipe.cuisineType || []).map(type => 
                    translateText(type, 'fr', 'en')
                )
            ),
            dietLabels: await Promise.all(
                (recipe.dietLabels || []).map(label => 
                    translateText(label, 'fr', 'en')
                )
            )
        };
        return { ...hit, recipe: translatedRecipe };
    }));

    return { 
        ...recipeData,
        hits: translatedHits
    };
}

// Stocke la langue de la dernière requête
export let lastQueryLanguage = 'fr';

export function setLastQueryLanguage(lang) {
    lastQueryLanguage = lang;
}