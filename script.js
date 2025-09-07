document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const indianRecipesButton = document.getElementById('indianRecipesButton');
    const resultsGrid = document.getElementById('resultsGrid');
    const loadingIndicator = document.getElementById('loading');
    const noResultsMessage = document.getElementById('noResults');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const recipeModal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalButton = document.getElementById('closeModalButton');

    const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

    searchButton.addEventListener('click', () => fetchRecipesBySearchTerm(searchInput.value));
    indianRecipesButton.addEventListener('click', fetchIndianRecipes);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchRecipesBySearchTerm(searchInput.value);
        }
    });

    // This listener is correctly placed once at the start.
    closeModalButton.addEventListener('click', () => {
        recipeModal.classList.add('hidden');
        modalContent.innerHTML = '';
    });

    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            recipeModal.classList.add('hidden');
            modalContent.innerHTML = '';
        }
    });

    async function fetchRecipesBySearchTerm(searchTerm) {
        const term = searchTerm.trim();
        if (!term) {
            showError('Please enter a recipe name or ingredient to search.');
            return;
        }

        showLoading();

        try {
            const response = await fetch(`${API_BASE_URL}search.php?s=${term}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.meals) {
                displayRecipes(data.meals);
            } else {
                showNoResults();
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            showError('Failed to fetch recipes. Please check your internet connection or try again later.');
        } finally {
            hideLoading();
        }
    }

    async function fetchIndianRecipes() {
        showLoading();
        try {
            const response = await fetch(`${API_BASE_URL}filter.php?a=Indian`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.meals) {
                displayRecipes(data.meals);
            } else {
                showNoResults();
            }
        } catch (error) {
            console.error('Error fetching Indian recipes:', error);
            showError('Failed to fetch Indian recipes. Please check your internet connection or try again later.');
        } finally {
            hideLoading();
        }
    }

    function displayRecipes(meals) {
        resultsGrid.innerHTML = '';
        meals.forEach(meal => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('bg-gray-50', 'rounded-2xl', 'shadow-md', 'overflow-hidden', 'transform', 'hover:scale-105', 'transition-all', 'duration-300', 'cursor-pointer');
            recipeCard.innerHTML = `
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h2 class="text-xl font-semibold text-gray-800 truncate mb-2">${meal.strMeal}</h2>
                            <button class="view-recipe-btn px-4 py-2 bg-lime-500 text-white font-semibold rounded-full hover:bg-lime-600 transition-colors duration-300" data-id="${meal.idMeal}">
                                View Recipe
                            </button>
                        </div>
                    `;
            resultsGrid.appendChild(recipeCard);
        });

        resultsGrid.querySelectorAll('.view-recipe-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const mealId = e.target.dataset.id;
                fetchRecipeDetails(mealId);
            });
        });
    }

    async function fetchRecipeDetails(id) {
        modalContent.innerHTML = `
                    <div class="flex justify-center items-center h-48">
                        <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-lime-500 border-gray-200"></div>
                    </div>
                `;
        recipeModal.classList.remove('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}lookup.php?i=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const meal = data.meals[0];
            if (meal) {
                displayRecipeDetails(meal);
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            modalContent.innerHTML = '<p class="text-center text-red-500">Failed to load recipe details.</p>';
        }
    }

    function displayRecipeDetails(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push(`${measure} ${ingredient}`);
            }
        }

        modalContent.innerHTML = `
                    <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full md:w-1/2 rounded-xl shadow-lg object-cover">
                        <div class="flex-1">
                            <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">${meal.strMeal}</h2>
                            <p class="text-gray-600 mb-4"><strong>Category:</strong> ${meal.strCategory}</p>
                            <p class="text-gray-600 mb-4"><strong>Cuisine:</strong> ${meal.strArea}</p>

                            <h3 class="text-xl font-semibold text-gray-700 mb-2">Ingredients:</h3>
                            <ul class="list-disc list-inside text-gray-600 mb-4">
                                ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                            </ul>

                            <h3 class="text-xl font-semibold text-gray-700 mb-2">Instructions:</h3>
                            <p class="text-gray-600 whitespace-pre-wrap">${meal.strInstructions}</p>
                            ${meal.strYoutube ? `<div class="mt-4"><a href="${meal.strYoutube}" target="_blank" class="px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors duration-300">Watch on YouTube</a></div>` : ''}
                        </div>
                    </div>
                `;
    }

    function showLoading() {
        resultsGrid.innerHTML = '';
        loadingIndicator.classList.remove('hidden');
        noResultsMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }

    function showNoResults() {
        resultsGrid.innerHTML = '';
        noResultsMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.classList.remove('hidden');
        errorText.textContent = message;
        noResultsMessage.classList.add('hidden');
    }
});