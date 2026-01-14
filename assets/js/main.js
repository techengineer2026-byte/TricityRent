// assets/js/main.js


window.addEventListener('scroll', function () {
    const navbar = document.getElementById('mainNavbar');

    if (window.scrollY > 10) {
        navbar.classList.add('shadow-sm');
    } else {
        navbar.classList.remove('shadow-sm');
    }
});


document.addEventListener("scroll", function () {
    const bottomNav = document.getElementById("mobileBottomNav");
    const footer = document.querySelector("footer");

    if (!bottomNav || !footer) return;

    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (footerRect.top < windowHeight - 50) {
        bottomNav.classList.add("nav-hidden");
    } else {
        bottomNav.classList.remove("nav-hidden");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("property-list-container");

    if (container) {
        loadProperties();
    }

    async function loadProperties() {
        try {
            const response = await fetch('../data/properties.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const propertiesData = await response.json();

            renderProperties(propertiesData);

        } catch (error) {
            console.error("Could not load properties:", error);
            container.innerHTML = `
                <div class="col-12 text-center text-danger py-5">
                    <p>Error loading properties. Please run on a Local Server.</p>
                    <small>${error.message}</small>
                </div>`;
        }
    }

    function renderProperties(data) {
        let htmlContent = "";

        Object.values(data).forEach((prop, index) => {

            let badgeClass = 'bg-success';
            let statusText = prop.status || 'For Sale';
            if (statusText.toLowerCase().includes('rent')) badgeClass = 'bg-primary';
            if (statusText.toLowerCase().includes('urgent')) badgeClass = 'bg-danger';

            const imageList = prop.images && prop.images.length > 0 ? prop.images : [];
            const carouselId = `carouselProp${index + 1}`;

            const loc = prop.location;
            let locationString = '';
            if (loc) {
                locationString = [
                    loc.sector,
                    loc.phase,
                    loc.city,
                    loc.district,
                    loc.state
                ].filter(Boolean).join(', ');
            }

            const features = [];
            if (prop.amenities) {
                features.push(...prop.amenities);
            }
            if (features.length === 0 && prop.description) {
                const words = prop.description.split(' ');
                const keyWords = ['AC', 'Security', 'Parking', 'Kitchen', 'Bath', 'Washroom', 'Gated'];
                keyWords.forEach(word => {
                    if (words.some(w => w.includes(word))) {
                        features.push(word);
                    }
                });
            }

            // CHANGED: Hide specific price, show generic message
            const priceDisplay = "Price on Request";

            htmlContent += `
            <div class="card property-list-card mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="row g-0 h-100">
                    
                    <!-- Left: Image Carousel -->
                    <div class="col-lg-5 position-relative">
                        <div id="${carouselId}" class="carousel slide h-100" data-bs-ride="false">
                            <div class="carousel-inner h-100">
                                ${imageList.map((img, i) => `
                                    <div class="carousel-item ${i === 0 ? 'active' : ''} h-100">
                                        <img src="${img}" class="d-block w-100 h-100 object-fit-cover" alt="${prop.title}">
                                    </div>
                                `).join('')}
                            </div>        
                            <!-- Carousel Controls -->
                            ${imageList.length > 1 ? `
                                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon bg-dark rounded-circle p-2" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                    <span class="carousel-control-next-icon bg-dark rounded-circle p-2" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>
                            ` : ''}
                        </div>

                        <!-- Badge -->
                        <div class="position-absolute top-0 start-0 m-3 badge ${badgeClass} shadow-sm">
                            ${statusText}
                        </div>
                    </div>

                    <!-- Right: Content -->
                    <div class="col-lg-7">
                        <div class="card-body p-4 d-flex flex-column h-100">
                            <div class="mb-2">
                                <!-- Changed color to blue (info) instead of success (money) -->
                                <h4 class="text-primary fw-bold mb-0">
                                    <i class="bi bi-info-circle me-1"></i> ${priceDisplay}
                                </h4>
                            </div>
                            <h5 class="card-title fw-bold mb-2">${prop.title}</h5>
                            <p class="text-secondary small mb-3">
                                <i class="bi bi-geo-alt-fill text-success me-1"></i> ${locationString}
                            </p>

                            <!-- Features -->
                            <div class="d-flex flex-wrap gap-2 mb-4">
                                ${features.slice(0, 3).map(feature => `
                                    <span class="feature-badge">
                                        <i class="bi bi-check-circle-fill me-1"></i> ${feature}
                                    </span>
                                `).join('')}
                            </div>

                            <!-- Buttons -->
                            <div class="mt-auto pt-3 border-top d-flex gap-3">
                                <button class="btn btn-outline-dark w-100 fw-medium">View Details</button>
                                
                                <!-- CHANGED: Call Button -->
                                <a href="tel:+917448422208" class="btn btn-success w-100 fw-medium">
                                    <i class="bi bi-telephone-fill me-1"></i> Call for Info
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = htmlContent;

        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            new bootstrap.Carousel(carousel, { interval: false });
        });
    }
});