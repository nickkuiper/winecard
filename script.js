document.addEventListener('DOMContentLoaded', function() {
    const wineContainer = document.getElementById('wine-sections');
    const loadingSpinner = document.getElementById('loading-spinner');
    const navbar = document.querySelector('.navbar');

    // Show spinner
    loadingSpinner.style.display = 'block';
    wineContainer.style.display = 'none';

    // Fetch and process wine data
    fetch('https://storage.googleapis.com/squarewine-card/wine_list.json?v=4')
        .then(response => response.json())
        .then(data => {
            // Hide spinner and show content
            loadingSpinner.style.display = 'none';
            wineContainer.style.display = 'block';

            const styleOrder = ['Bier', 'Bubbels', 'Wit','Rose', 'Rood', 'Dessert'];
            styleOrder.forEach(style => {
                const link = document.createElement('a');
                link.href = `#${style}`;
                link.textContent = style;
                navbar.appendChild(link);
            });

            processWineData(data);

            // Smooth scrolling for anchor links
            document.querySelectorAll('.navbar a').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();

                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error fetching wine data:', error);
            // Hide spinner and show error
            loadingSpinner.style.display = 'none';
            wineContainer.style.display = 'block';
            wineContainer.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Wine Data</h2>
                    <p>Sorry, we couldn't load the wine list. Please try again later.</p>
                </div>
            `;
        });
});

function populateFilters(wines) {
    const colorFilters = document.getElementById('color-filters');
    const countryFilters = document.getElementById('country-filters');
    const varietalFilters = document.getElementById('varietal-filters');

    const colors = [...new Set(wines.map(wine => wine.Style))];
    const countries = [...new Set(wines.map(wine => wine.Country))];
    const varietals = [...new Set(wines.map(wine => wine.Varietal))];

    createFilterButtons(colorFilters, colors, 'color');
    createFilterButtons(countryFilters, countries, 'country');
    createFilterButtons(varietalFilters, varietals, 'varietal');
}

function createFilterButtons(container, items, filterType) {
    items.sort().forEach(item => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', item);
        button.textContent = item;
        container.appendChild(button);
    });
}

function applyFilters() {
    const activeColorFilters = getActiveFilters('color-filters');
    const activeCountryFilters = getActiveFilters('country-filters');
    const activeVarietalFilters = getActiveFilters('varietal-filters');

    document.querySelectorAll('.wine-text').forEach(wine => {
        const style = wine.getAttribute('data-style');
        const country = wine.getAttribute('data-country');
        const varietal = wine.getAttribute('data-varietal');

        const colorMatch = activeColorFilters.length === 0 || activeColorFilters.includes(style);
        const countryMatch = activeCountryFilters.length === 0 || activeCountryFilters.includes(country);
        const varietalMatch = activeVarietalFilters.length === 0 || activeVarietalFilters.includes(varietal);

        if (colorMatch && countryMatch && varietalMatch) {
            wine.style.display = 'block';
        } else {
            wine.style.display = 'none';
        }
    });
}

function getActiveFilters(containerId) {
    const activeFilters = [];
    document.querySelectorAll(`#${containerId} .filter-btn.active`).forEach(btn => {
        activeFilters.push(btn.getAttribute('data-filter'));
    });
    return activeFilters;
}

function processWineData(wines) {
    const styleOrder = ['Bier', 'Bubbels', 'Wit','Rose', 'Rood', 'Dessert'];
    const winesByStyle = {};
    styleOrder.forEach(style => winesByStyle[style] = []);

    wines.forEach(wine => {
        if (styleOrder.includes(wine.Style)) {
            winesByStyle[wine.Style].push(wine);
        }
    });

    const wineContainer = document.getElementById('wine-sections');
    wineContainer.innerHTML = '';

    styleOrder.forEach(style => {
        if (winesByStyle[style].length > 0) {
            winesByStyle[style].sort((a, b) => a.Country.localeCompare(b.Country));

            const section = document.createElement('div');
            section.className = 'section';
            section.id = style;
            section.setAttribute('data-style', style);
            section.innerHTML = `<h2 class="section-title">${style}</h2>`;

            const wineList = document.createElement('div');
            wineList.className = 'wine-list';

            const winesByCountry = {};
            winesByStyle[style].forEach(wine => {
                if (!winesByCountry[wine.Country]) {
                    winesByCountry[wine.Country] = [];
                }
                winesByCountry[wine.Country].push(wine);
            });

            Object.keys(winesByCountry).sort().forEach(country => {
                const countryDivider = document.createElement('div');
                countryDivider.className = 'country-divider';
                countryDivider.textContent = country;
                wineList.appendChild(countryDivider);

                winesByCountry[country].forEach(wine => {
                    const wineText = createWineText(wine);
                    wineList.appendChild(wineText);
                });
            });

            section.appendChild(wineList);
            wineContainer.appendChild(section);
        }
    });
}

/**
 * UPDATED FUNCTION
 * This function now checks for a wine.Description and adds it below the details.
 */
function createWineText(wine) {
    const wineText = document.createElement('div');
    wineText.className = 'wine-text';

    let titleLine = `${wine.Producer} | ${wine.Name}`;
    let details = [wine.Year, wine.Region, wine.Varietal].filter(Boolean).join(' | ');

    // Conditionally create the description row if wine.Description is not null or empty.
    // It uses the 'wine-details' class as requested for consistent styling.
    let descriptionLine = (wine.Description && wine.Description.trim() !== "")
        ? `<div class="wine-description">${wine.Description}</div>`
        : '';

    wineText.innerHTML = `
        <div class="wine-title">${titleLine}</div>
        ${details ? `<div class="wine-details">${details}</div>` : ''}
        ${descriptionLine}
    `;

    return wineText;
}
