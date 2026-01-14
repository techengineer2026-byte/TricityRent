// assets/js/office-main.js

/* assets/js/office-main.js */

let allOfficeData = []; // Store raw data
let currentData = [];   // Store filtered data
let currentType = 'All';
let currentCity = 'All';

document.addEventListener("DOMContentLoaded", function () {
    loadOffices();
});

// 1. FETCH DATA
async function loadOffices() {
    const container = document.getElementById("office-list-container");

    try {
        const response = await fetch('../data/offices.json');
        const dataObj = await response.json();

        // Convert Object to Array for easier filtering
        allOfficeData = Object.values(dataObj);
        currentData = [...allOfficeData]; // Initial state

        renderOffices(currentData);

    } catch (error) {
        console.error(error);
        if (container) {
            container.innerHTML = `<div class="col-12 text-center py-5 text-danger">Failed to load listings. Please try again later.</div>`;
        }
    }
}

// 2. FILTER LOGIC (Connected to HTML Buttons)
function filterOffice(category, value) {
    // A. Update UI Active States
    if (category === 'type') {
        currentType = value;
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
        const target = document.querySelector(`.type-card[onclick="filterOffice('type', '${value}')"]`);
        if (target) target.classList.add('active');
    }

    if (category === 'city') {
        currentCity = value;
        document.querySelectorAll('.location-pill').forEach(c => c.classList.remove('active'));
        const target = document.querySelector(`.location-pill[onclick="filterOffice('city', '${value}')"]`);
        if (target) target.classList.add('active');
    }

    // B. Filter Data
    currentData = allOfficeData.filter(item => {
        // 1. City Match
        const cityMatch = (currentCity === 'All') || (item.location.city === currentCity);

        // 2. Type Match (Handle Mismatches like "Corporate" vs "IT Park")
        let typeMatch = false;
        if (currentType === 'All') {
            typeMatch = true;
        } else if (currentType === 'Corporate') {
            // "Corporate" filter matches 'Office' or 'IT Park'
            typeMatch = (item.type === 'Office' || item.type === 'IT Park');
        } else {
            // Direct match for Showroom, Co-Working
            typeMatch = (item.type === currentType);
        }

        return cityMatch && typeMatch;
    });

    // Reset sort dropdown
    const sortDropdown = document.querySelector('select[onchange="sortOffices(this.value)"]');
    if (sortDropdown) sortDropdown.value = 'default';

    renderOffices(currentData);
}

// 3. SORT LOGIC
function sortOffices(criteria) {
    let sorted = [...currentData];

    // Helper to get Number from Price String (e.g. "₹65,000" -> 65000)
    const getPrice = (str) => {
        if (!str || str.includes("Request") || str.includes("Call")) return 0; // "Price on Request" = 0
        return parseInt(str.replace(/[^0-9]/g, '')) || 0;
    };

    // Helper to get Number from Area String (e.g. "2,500 Sq.Ft" -> 2500)
    const getArea = (str) => {
        return parseInt(str.replace(/[^0-9]/g, '')) || 0;
    };

    if (criteria === 'price-asc') {
        // Low to High (Put "Price on Request"/0 at bottom)
        sorted.sort((a, b) => {
            const pA = getPrice(a.price);
            const pB = getPrice(b.price);
            if (pA === 0) return 1;
            if (pB === 0) return -1;
            return pA - pB;
        });
    } else if (criteria === 'price-desc') {
        // High to Low
        sorted.sort((a, b) => getPrice(b.price) - getPrice(a.price));
    } else if (criteria === 'area-desc') {
        // Large Area to Small
        sorted.sort((a, b) => getArea(b.area) - getArea(a.area));
    }

    renderOffices(sorted);
}

// 4. RENDER LOGIC
function renderOffices(properties) {
    const container = document.getElementById("office-list-container");
    const countLabel = document.getElementById("count-label");

    if (!container) return;

    // Update Count
    if (countLabel) countLabel.innerText = `${properties.length} Listings Found`;

    // No Results State
    if (properties.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-building-slash display-4 text-secondary opacity-50"></i>
                <p class="mt-3 text-secondary">No offices found matching your filters.</p>
                <button class="btn btn-outline-dark btn-sm rounded-pill" onclick="filterOffice('city','All'); filterOffice('type','All')">Reset Filters</button>
            </div>`;
        return;
    }

    let html = "";

    properties.forEach((prop, index) => {
        const carouselId = `officeSlide${index}`;
        const imgList = prop.images || ['https://via.placeholder.com/400x300?text=No+Image'];

        // Features (Max 2)
        const featuresHtml = (prop.features || []).slice(0, 3).map(f =>
            `<span class="badge bg-light text-secondary border fw-normal me-1 mb-1">${f}</span>`
        ).join('');

        // Price Logic (Coloring)
        let priceClass = prop.price.includes("Request") || prop.price.includes("Call") ? "text-secondary small" : "text-success fw-bold fs-5";

        html += `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-4 shadow-sm overflow-hidden hover-lift">
                
                <!-- Image Area -->
                <div class="position-relative">
                    <div id="${carouselId}" class="carousel slide" data-bs-ride="false">
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <img src="${imgList[0]}" class="d-block w-100 object-fit-cover" height="220" alt="${prop.title}">
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute top-0 start-0 m-3 badge bg-white text-dark shadow-sm border">
                        ${prop.type}
                    </div>
                    <div class="position-absolute top-0 end-0 m-3 badge bg-success shadow-sm">
                        ${prop.status}
                    </div>
                </div>

                <!-- Content Area -->
                <div class="card-body p-4 d-flex flex-column">
                    
                    <h5 class="card-title fw-bold mb-1 text-dark">${prop.title}</h5>
                    <p class="text-secondary small mb-3">
                        <i class="bi bi-geo-alt-fill text-danger"></i> ${prop.location.sector}, ${prop.location.city}
                    </p>

                    <!-- Specs Row -->
                    <div class="d-flex justify-content-between border-top border-bottom py-2 mb-3 small text-secondary">
                        <span><i class="bi bi-arrows-fullscreen"></i> ${prop.area}</span>
                        <span><i class="bi bi-check-circle"></i> Verified</span>
                    </div>

                    <!-- Features Tags -->
                    <div class="mb-3">
                        ${featuresHtml}
                    </div>

                    <!-- Price & CTA -->
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <div class="${priceClass}">
                            ${prop.price}
                        </div>
                        <a href="../contact-us/index.html?prop=${prop.id}" class="btn btn-outline-dark rounded-pill px-3 btn-sm fw-bold">
                            View Details
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}