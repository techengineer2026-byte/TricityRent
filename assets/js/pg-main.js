// assets/js/pg-main.js

/* =========================================
   PG & RENTAL LOGIC
   ========================================= */

let allPGData = []; // Store data globally for filtering

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("pg-list-container");

    if (container) {
        loadPGData();
    }
});

async function loadPGData() {
    try {
        // Fetch specific PG JSON
        const response = await fetch('../data/pgdata.json');
        const data = await response.json();

        // Convert Object to Array
        allPGData = Object.values(data);

        // Initial Render (Show All)
        renderPGList(allPGData);

    } catch (error) {
        console.error("Error loading PGs:", error);
        document.getElementById("pg-list-container").innerHTML = `<p class="text-danger text-center">Failed to load data.</p>`;
    }
}

// Function to Filter from HTML Buttons
function filterPG(category) {
    if (category === 'All') {
        renderPGList(allPGData);
    } else {
        const filtered = allPGData.filter(item => item.category === category);
        renderPGList(filtered);
    }
}

function renderPGList(properties) {
    const container = document.getElementById("pg-list-container");
    const countLabel = document.getElementById("count-label");

    // Update Count
    if (countLabel) countLabel.innerText = `${properties.length} Results Found`;

    if (properties.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-secondary">No properties found in this category.</div>`;
        return;
    }

    let html = "";

    properties.forEach((prop, index) => {

        // 1. Badge Logic (Gender Specific)
        let badgeColor = 'bg-secondary';
        let badgeIcon = 'bi-house';

        if (prop.category === 'Boys') {
            badgeColor = 'bg-primary'; // Blue
            badgeIcon = 'bi-gender-male';
        } else if (prop.category === 'Girls') {
            badgeColor = 'bg-danger'; // Pink/Red
            badgeIcon = 'bi-gender-female';
        } else if (prop.category === '1 BHK') {
            badgeColor = 'bg-success'; // Green
            badgeIcon = 'bi-house-heart';
        }

        // 2. Amenities Tags
        let amenitiesHtml = prop.amenities.map(tag =>
            `<span class="feature-badge me-2 mb-2"><i class="bi bi-check2"></i> ${tag}</span>`
        ).join('');

        // 3. Carousel ID
        const carouselId = `pgCarousel${index}`;
        const imgList = prop.images && prop.images.length > 0 ? prop.images : ['https://via.placeholder.com/400x300'];

        // 4. HTML Card
        html += `
        <div class="card property-list-card mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="row g-0 h-100">
                
                <!-- Left: Image -->
                <div class="col-lg-5 position-relative">
                    <div id="${carouselId}" class="carousel slide h-100" data-bs-ride="false">
                        <div class="carousel-inner h-100">
                            ${imgList.map((img, i) => `
                                <div class="carousel-item ${i === 0 ? 'active' : ''} h-100">
                                    <img src="${img}" class="d-block w-100 h-100 object-fit-cover" alt="PG Image">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Gender/Type Badge -->
                    <div class="position-absolute top-0 start-0 m-3 badge ${badgeColor} shadow-sm px-3 py-2">
                        <i class="bi ${badgeIcon}"></i> ${prop.category}
                    </div>
                </div>

                <!-- Right: Details -->
                <div class="col-lg-7">
                    <div class="card-body p-4 d-flex flex-column h-100">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h4 class="text-success fw-bold mb-0">${prop.price}</h4>
                            <small class="text-muted border px-2 py-1 rounded">${prop.occupancy}</small>
                        </div>

                        <h5 class="card-title fw-bold mb-1">${prop.title}</h5>
                        <p class="text-secondary small mb-3">
                            <i class="bi bi-geo-alt-fill text-success"></i> ${prop.location.sector}, ${prop.location.city}
                        </p>

                        <!-- Amenities -->
                        <div class="d-flex flex-wrap mb-3">
                            ${amenitiesHtml}
                        </div>

                        <div class="mt-auto pt-3 border-top d-flex gap-3">
                            <button class="btn btn-outline-success w-100 fw-medium">View Details</button>
                            <a href="tel:+919876543210" class="btn btn-success w-100 fw-medium">
                                <i class="bi bi-telephone-fill"></i> Call Owner
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}