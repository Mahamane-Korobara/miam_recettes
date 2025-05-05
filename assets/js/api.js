window.ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";

const APP_ID = "7d05b631";
const APP_KEY = "6478ae312c566df70854828805c4033d";
const TYPE = "public";

export const fetchData = async function (queries, successCallback) {
    try {
        const url = new URL(ACCESS_POINT);
        url.searchParams.append('app_id', APP_ID);
        url.searchParams.append('app_key', APP_KEY);
        url.searchParams.append('type', TYPE);
        // url.searchParams.append('field', 'uri');
        // url.searchParams.append('field', 'label');
        // url.searchParams.append('field', 'image');
        // url.searchParams.append('field', 'totalTime');

        // Gestion spéciale des paramètres existants dans l'URL
        if (queries && queries.length) {
            queries.forEach(([key, value]) => {
                if (value && key !== '_cont') {
                    url.searchParams.append(key, value);
                } else if (key === '_cont') {
                    // Ne pas réencoder _cont qui est déjà encodé
                    url.search += `&_cont=${value}`;
                }
            });
        }

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                // "Accept-Language": "fr",
                "Edamam-Account-User": APP_ID
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || `Erreur ${response.status}`);
        }

        const data = await response.json();
        successCallback(data);
    } catch (error) {
        console.error('Erreur API:', error);
        // Gestion d'erreur améliorée
        const errorContainer = document.querySelector("[data-error-container]");
        if (errorContainer) {
            errorContainer.innerHTML = `
                <p class="error-message">Erreur de chargement des recettes</p>
                <p class="error-detail">${error.message}</p>
            `;
        }
    }
};