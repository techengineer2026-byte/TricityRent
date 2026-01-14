// assets/js/apartments.js

/* assets/js/apartments.js */

let allApt = [];
let currentData = [];
let currentCity = 'All';
let currentType = 'All';   // 2 BHK, 3 BHK, etc.
let currentCat = 'All';    // Sale vs Rent

document.addEventListener("DOMContentLoaded", function () {
    loadApartments();
});

// 1. FETCH
async function loadApartments() {
    const container = document.getElementById("apt-list-container");
    try {
        const response = await fetch('../data/apartments.json');
        const dataObj = await response.json();

        allApt = Object.values(dataObj);
        currentData = [...allApt];
        renderApts(currentData);

    } catch (error) {
        console.error("Load Error:", error);
        container.innerHTML = `<div class="col-12 text-center text-danger py-5">Unable to load listings.</div>`;
    }
}

// 2. FILTER
function filterApt(key, value) {
    // UI Update Logic
    if (key === 'type' || key === 'category') {
        // Reset category if type is selected, or vice versa if needed
        if (key === 'category') {
            currentCat = value;
            if (value === 'Rent') currentType = 'All'; // Logic: If renting, clear BHK filter or keep it? Let's clear visual focus
        }
        else {
            currentType = value;
            currentCat = 'All'; // Reset rent filter if BHK selected
        }

        // Visual Active State for Cards
        document.querySelectorAll('.config-card').forEach(c => c.classList.remove('active'));

        // Find clicked card (Complex selector because of two logic flows)
        let selector = '';
        if (key === 'type') selector = `.config-card[onclick="filterApt('type', '${value}')"]`;
        else selector = `.config-card[onclick="filterApt('category', '${value}')"]`;

        const target = document.querySelector(selector);
        if (target) target.classList.add('active');
    }

    if (key === 'city') {
        currentCity = value;
        const buttons = document.querySelectorAll(`button[onclick^="filterApt('city'"]`);
        buttons.forEach(b => {
            b.classList.remove('btn-dark', 'active');
            b.classList.add('btn-outline-secondary');
        });
        const target = document.querySelector(`button[onclick="filterApt('city', '${value}')"]`);
        if (target) {
            target.classList.remove('btn-outline-secondary');
            target.classList.add('btn-dark', 'active');
        }
    }

    // Filter Logic
    currentData = allApt.filter(item => {
        const cityMatch = (currentCity === 'All') || (item.location.city === currentCity);

        // Complex Type/Category Match
        let typeMatch = true;

        if (currentCat === 'Rent') {
            typeMatch = (item.category === 'Rent');
        } else if (currentType !== 'All') {
            typeMatch = (item.type === currentType);
        }

        return cityMatch && typeMatch;
    });

    renderApts(currentData);
}

// 3. SORT
function sortApt(criteria) {
    let sorted = [...currentData];
    if (criteria === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (criteria === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    renderApts(sorted);
}

// 4. FORMAT PRICE HELPER (Sale vs Rent)
function formatAptPrice(price, category) {
    if (!price) return "Call for Price";

    // Rent Logic
    if (category === 'Rent' || price < 100000) {
        return `₹ ${price.toLocaleString()}<small class="text-muted fw-normal">/mo</small>`;
    }

    // Sale Logic
    if (price >= 10000000) {
        return `₹ ${(price / 10000000).toFixed(2)} <small>Cr</small>`;
    } else {
        return `₹ ${(price / 100000).toFixed(1)} <small>Lakh</small>`;
    }
}

// 5. RENDER
function renderApts(data) {
    const container = document.getElementById("apt-list-container");
    const label = document.getElementById("count-label");

    container.innerHTML = '';
    label.innerText = `${data.length} Properties`;

    if (data.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5">No apartments found. <br><button class="btn btn-sm btn-link" onclick="location.reload()">Reset</button></div>`;
        return;
    }

    data.forEach(item => {
        // Status Badge Color
        let statusBadge = item.status === 'Ready to Move' ? 'bg-success' : 'bg-warning text-dark';

        // Features
        const featHtml = (item.features || []).slice(0, 2).map(f =>
            `<span class="amenity-badge"><i class="bi bi-check2"></i> ${f}</span>`
        ).join('');

        const html = `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 rounded-4 shadow-sm overflow-hidden property-card">
                <div class="position-relative">
                    <img src="${item.image}" class="card-img-top object-fit-cover" height="220" alt="${item.title}">
                    <div class="position-absolute top-0 start-0 m-3 badge bg-white text-dark border shadow-sm">
                        ${item.type}
                    </div>
                    <div class="position-absolute bottom-0 end-0 m-3 badge ${statusBadge} shadow-sm">
                        ${item.status}
                    </div>
                </div>

                <div class="card-body p-3">
                    <h5 class="card-title fw-bold text-dark mb-1 text-truncate">${item.title}</h5>
                    <p class="text-secondary small mb-3"><i class="bi bi-geo-alt-fill text-danger"></i> ${item.location.sector}, ${item.location.city}</p>
                    
                    <div class="d-flex justify-content-between border-bottom pb-2 mb-2 small text-muted">
                        <span>${item.area}</span>
                        <span>${item.category}</span>
                    </div>

                    <div class="mb-3 d-flex gap-1 flex-wrap">
                        ${featHtml}
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div class="fs-5 fw-bold text-success">
                            ${formatAptPrice(item.price, item.category)}
                        </div>
                        <a href="../contact-us/index.html?prop=${item.id}" class="btn btn-outline-dark btn-sm rounded-pill px-3">View</a>
                    </div>
                </div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}