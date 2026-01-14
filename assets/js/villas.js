// assets/js/villas.js

/* assets/js/villas.js */

let allVillas = [];
let currentData = [];
let currentCity = 'All';
let currentType = 'All';

document.addEventListener("DOMContentLoaded", function () {
    loadVillas();
});

// 1. FETCH DATA
async function loadVillas() {
    const container = document.getElementById("villa-list-container");
    try {
        const response = await fetch('../data/villas.json');
        const dataObj = await response.json();

        allVillas = Object.values(dataObj);
        currentData = [...allVillas];

        renderVillas(currentData);
    } catch (error) {
        console.error("Error loading villas:", error);
        container.innerHTML = `<div class="col-12 text-center py-5 text-danger">Failed to load properties.</div>`;
    }
}

// 2. FILTER LOGIC
function filterVillas(category, value) {

    // UI Updates (Active State)
    if (category === 'type') {
        currentType = value;
        document.querySelectorAll('.luxury-card').forEach(el => el.classList.remove('active'));
        const target = document.querySelector(`.luxury-card[onclick="filterVillas('type', '${value}')"]`);
        if (target) target.classList.add('active');
    }

    if (category === 'city') {
        currentCity = value;
        // Buttons handling
        const buttons = document.querySelectorAll(`button[onclick^="filterVillas('city'"]`);
        buttons.forEach(btn => btn.classList.remove('active', 'btn-dark', 'text-white'));
        buttons.forEach(btn => btn.classList.add('btn-outline-secondary'));

        const target = document.querySelector(`button[onclick="filterVillas('city', '${value}')"]`);
        if (target) {
            target.classList.remove('btn-outline-secondary');
            target.classList.add('active', 'btn-dark', 'text-white');
        }
    }

    // Filter Data
    currentData = allVillas.filter(item => {
        const cityMatch = (currentCity === 'All') || (item.location.city === currentCity);
        const typeMatch = (currentType === 'All') || (item.type === currentType);
        return cityMatch && typeMatch;
    });

    renderVillas(currentData);
}

// 3. SORT LOGIC
function sortVillas(criteria) {
    let sorted = [...currentData];

    if (criteria === 'price-desc') {
        sorted.sort((a, b) => b.price - a.price);
    }
    else if (criteria === 'price-asc') {
        // Handle "Price on Request" (0) to go to bottom
        sorted.sort((a, b) => {
            if (a.price === 0) return 1;
            if (b.price === 0) return -1;
            return a.price - b.price;
        });
    }
    // Simple Area sort based on string parsing logic would go here
    // For demo, we assume default order for area

    renderVillas(sorted);
}

// 4. HELPER: Format Price
function formatPrice(price) {
    if (!price || price === 0) return '<span class="text-muted fs-6">Price on Request</span>';

    if (price >= 10000000) {
        return `₹ ${(price / 10000000).toFixed(2)} <small>Cr</small>`;
    } else {
        return `₹ ${(price / 100000).toFixed(1)} <small>Lakh</small>`;
    }
}

// 5. RENDER LOGIC
function renderVillas(data) {
    const container = document.getElementById("villa-list-container");
    const countLabel = document.getElementById("count-label");

    container.innerHTML = '';
    countLabel.innerText = `${data.length} Villas Found`;

    if (data.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><h5>No properties found.</h5><button class="btn btn-outline-dark btn-sm mt-2" onclick="location.reload()">Reset</button></div>`;
        return;
    }

    data.forEach(item => {
        // Features tags
        const featuresHtml = (item.features || []).slice(0, 2).map(f =>
            `<span class="badge bg-white border text-secondary fw-normal me-1">${f}</span>`
        ).join('');

        const html = `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-4 shadow-sm overflow-hidden property-card">
                <div class="position-relative">
                    <img src="${item.image}" class="card-img-top object-fit-cover" height="250" alt="${item.title}">
                    <div class="position-absolute top-0 start-0 m-3 badge bg-dark text-white shadow-sm px-3 py-2">
                        ${item.type}
                    </div>
                    <div class="position-absolute bottom-0 end-0 m-3 badge bg-white text-dark shadow-sm">
                        ${item.plot_area}
                    </div>
                </div>
                
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small class="text-uppercase text-muted fw-bold tracking-wide">${item.status}</small>
                        <div class="text-warning">
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-fill"></i>
                            <i class="bi bi-star-half"></i>
                        </div>
                    </div>

                    <h5 class="card-title fw-bold mb-1">${item.title}</h5>
                    <p class="text-secondary small mb-3"><i class="bi bi-geo-alt-fill text-danger"></i> ${item.location.sector}, ${item.location.city}</p>

                    <!-- Bed/Bath Chips -->
                    <div class="d-flex gap-2 mb-4">
                        <span class="feature-chip"><i class="bi bi-person-workspace"></i> ${item.beds} Beds</span>
                        <span class="feature-chip"><i class="bi bi-droplet"></i> ${item.baths} Baths</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                        <div class="price-text-lg">
                            ${formatPrice(item.price)}
                        </div>
                        <div class="d-flex gap-2">
                             <a href="https://wa.me/918360769451?text=Hi, I am interested in ${item.title}" class="btn btn-success rounded-circle" target="_blank"><i class="bi bi-whatsapp"></i></a>
                             <a href="../contact-us/index.html?prop=${item.id}" class="btn btn-outline-dark rounded-pill px-3">View</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}