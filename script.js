// Fetch and process wine data
fetch('https://storage.googleapis.com/squarewine-card/wine_list.json')
    .then(response => response.json())
    .then(data => {
        processWineData(data);

        // Add event listeners to filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                document.querySelectorAll('.section').forEach(section => {
                    section.style.display = (filter === 'all' || section.getAttribute('data-style') === filter) ? 'block' : 'none';
                });
            });
        });
    })
    .catch(error => {
        console.error('Error fetching wine data:', error);
        document.getElementById('wine-sections').innerHTML = `
            <div class="error-message">
                <h2>Error Loading Wine Data</h2>
                <p>Sorry, we couldn't load the wine list. Please try again later.</p>
            </div>
        `;
    });

function processWineData(wines) {
    const styleOrder = ['Bier', 'Bubbels', 'Wit', 'Rood', 'Dessert'];
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

function createWineText(wine) {
    const wineText = document.createElement('div');
    wineText.className = 'wine-text';

    let titleLine = `${wine.Producer} | ${wine.Name}`;
    let details = [wine.Year, wine.Region, wine.Varietal].filter(Boolean).join(' | ');

    wineText.innerHTML = `
        <div class="wine-title">${titleLine}</div>
        ${details ? `<div class="wine-details">${details}</div>` : ''}
    `;

    return wineText;
}
