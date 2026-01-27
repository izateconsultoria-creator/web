document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuOpen');
    const sidebar = document.getElementById('navSidebar');
    const navLinks = document.querySelectorAll('.nav-sidebar a');

    const modal = document.getElementById('contactModal');
    // Mantenemos tus selectores originales y añadimos .cta-button para que funcione en todas las páginas
    const openModalBtns = document.querySelectorAll('#openModal, #openModalMobile, .cta-button');
    const closeModalBtn = document.getElementById('closeModal');

    // FORMULARIO
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    // FORMULARIO PÁGINA CONTACTO
    const contactPageForm = document.getElementById('contactPageForm');
    const contactPageSuccess = document.getElementById('contactPageSuccess');

    // Guardamos display original para no romper el diseño
    const originalDisplay = contactForm ? getComputedStyle(contactForm).display : 'block';

    // --- ASEGURAR QUE EL MODAL INICIE OCULTO ---
    if (modal) {
        modal.style.display = 'none';
    }

    // --- MENÚ MÓVIL ---
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });

        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
            menuBtn.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- MODAL ---
    if (openModalBtns && modal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault(); 

                modal.style.display = 'flex'; 
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);

                if (contactForm) contactForm.style.display = originalDisplay;
                if (formSuccess) formSuccess.style.display = 'none';

                if (sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    menuBtn.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);

            if (contactForm) contactForm.reset();
            if (contactForm) contactForm.style.display = originalDisplay;
            if (formSuccess) formSuccess.style.display = 'none';
        });
    }

    // --- CLIC FUERA PARA CERRAR ---
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = "none";
                document.body.style.overflow = ''; 
            }, 300);

            if (contactForm) contactForm.reset();
            if (contactForm) contactForm.style.display = originalDisplay;
            if (formSuccess) formSuccess.style.display = 'none';
        }
    });

    // --- ENVÍO FORMULARIO (MODAL) ---
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);

            fetch('https://formspree.io/f/maqqvnvq', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    contactForm.style.display = 'none';
                    if (formSuccess) formSuccess.style.display = 'block';
                    contactForm.reset();
                } else {
                    alert('Hubo un error al enviar el formulario.');
                }
            })
            .catch(() => {
                alert('Error de conexión. Intenta más tarde.');
            });
        });
    }

    // --- ENVÍO FORMULARIO PÁGINA CONTACTO ---
    if (contactPageForm) {
        contactPageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactPageForm);

            fetch('https://formspree.io/f/maqqvnvq', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    contactPageForm.reset();
                    const submitBtn = contactPageForm.querySelector('.submit-btn');
                    if (submitBtn) submitBtn.style.display = 'none';
                    if (contactPageSuccess) contactPageSuccess.style.display = 'block';
                } else {
                    alert('Hubo un error al enviar el formulario.');
                }
            })
            .catch(() => {
                alert('Error de conexión. Intenta más tarde.');
            });
        });
    }

    // --- INTRO LOTTIE (RESTAURADA A TU ORIGINAL) ---
    const intro = document.getElementById('intro');
    const lottieContainer = document.getElementById('lottieIntro');

    if (intro && lottieContainer && window.lottie) {
        const animation = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'https://res.cloudinary.com/degqhlfa0/raw/upload/v1769390965/data_u100t6.json'
        });

        animation.addEventListener('complete', () => {
           // Aquí se queda tal como lo tenías, sin el display:none
        });
    }
});

const animatedElements = document.querySelectorAll('.animate');
const runEntryAnimations = () => {
    animatedElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('is-visible');
        }, index * 180);
    });
};

window.addEventListener('load', () => {
    runEntryAnimations();
});