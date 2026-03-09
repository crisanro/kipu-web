/**
 * Kipu Main Logic
 * Maneja menú móvil, carruseles, navegación y redirección de consulta
 */

// 1. FUNCIÓN GLOBAL DE REDIRECCIÓN
// Se deja fuera para que el "onclick" del HTML funcione correctamente
function irAConsultar() {
    const input = document.getElementById('claveHome');
    if (!input) return;

    const clave = input.value.trim();
    
    // Validamos que tenga los 49 dígitos antes de mandarlo
    if (clave.length === 49 && /^\d+$/.test(clave)) {
        // Redirigimos a la página de consulta pasando el ID por parámetro
        window.location.href = `/consultar?id=${clave}`;
    } else {
        alert("Por favor, ingresa los 49 dígitos de la clave de acceso.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 2. MENÚ MÓVIL ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // --- 3. SCROLL SUAVE ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.startsWith('/')) return; // Evitar interferir con links a otras páginas
            
            e.preventDefault();
            navLinks.classList.remove('active'); 
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- 4. LÓGICA DE CARRUSELES ---
    const initCarousel = (scrollContainerId) => {
        const container = document.getElementById(scrollContainerId);
        if (!container) return;

        const btnPrev = document.querySelector(`.carousel-btn.prev[data-target="${scrollContainerId}"]`);
        const btnNext = document.querySelector(`.carousel-btn.next[data-target="${scrollContainerId}"]`);
        
        const scrollAmount = 360; 

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
        
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        // Drag to scroll
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
    };

    initCarousel('benefitsScroll');
    initCarousel('pricingScroll');

    // --- 5. FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('active');
                });
                item.classList.toggle('active');
            });
        }
    });

    // --- 6. EVENTO ENTER EN BUSCADOR HOME ---
    const inputHome = document.getElementById('claveHome');
    if (inputHome) {
        inputHome.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                irAConsultar();
            }
        });
    }
});