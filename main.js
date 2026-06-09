document.addEventListener('DOMContentLoaded', () => {

    // ── MENÚ MÓVIL ──
    const menuBtn = document.getElementById('menuOpen');
    const sidebar = document.getElementById('navSidebar');
    const navLinks = document.querySelectorAll('.nav-sidebar a');

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

    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar) sidebar.classList.remove('active');
                if (menuBtn) menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ── MODAL ──
    const modal = document.getElementById('contactModal');
    const openModalBtns = document.querySelectorAll('#openModal, #openModalMobile, .cta-button');
    const closeModalBtn = document.getElementById('closeModal');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const originalDisplay = contactForm ? getComputedStyle(contactForm).display : 'block';

    if (modal) modal.style.display = 'none';

    if (openModalBtns && modal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
                if (contactForm) contactForm.style.display = originalDisplay;
                if (formSuccess) formSuccess.style.display = 'none';
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    if (menuBtn) menuBtn.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
            if (contactForm) { contactForm.reset(); contactForm.style.display = originalDisplay; }
            if (formSuccess) formSuccess.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
            if (contactForm) { contactForm.reset(); contactForm.style.display = originalDisplay; }
            if (formSuccess) formSuccess.style.display = 'none';
        }
    });

    // ── FORMULARIO MODAL ──
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            fetch('https://formspree.io/f/maqqvnvq', {
                method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
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
            .catch(() => alert('Error de conexión. Intenta más tarde.'));
        });
    }

    // ── FORMULARIO PÁGINA CONTACTO ──
    const contactPageForm = document.getElementById('contactPageForm');
    const contactPageSuccess = document.getElementById('contactPageSuccess');

    if (contactPageForm) {
        contactPageForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactPageForm);
            fetch('https://formspree.io/f/maqqvnvq', {
                method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
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
            .catch(() => alert('Error de conexión. Intenta más tarde.'));
        });
    }

    // ── CHAT ──
    const chatWrapper = document.getElementById('chat-interface-wrapper');
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    const chatMessagesArea = document.getElementById('chat-messages-area');
    const agentCards = document.querySelectorAll('.agent-card');

    if (chatWrapper && chatInput && chatForm) {
        const expandChat = () => {
            if (!chatWrapper.classList.contains('expanded')) {
                chatWrapper.classList.add('expanded');
                setTimeout(() => {
                    chatWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    chatInput.focus();
                }, 300);
            }
        };

        chatInput.addEventListener('focus', expandChat);
        chatInput.addEventListener('click', expandChat);

        agentCards.forEach(card => {
            card.addEventListener('click', () => {
                agentCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const agentName = card.querySelector('span.font-semibold').textContent;
                const sysMsg = document.createElement('div');
                sysMsg.className = 'flex justify-center w-full my-2 animate-fade-in';
                sysMsg.innerHTML = `<span class="bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/40 px-3 py-1 rounded-full">Conversando con ${agentName}</span>`;
                chatMessagesArea.appendChild(sysMsg);
                chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });
            });
        });

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (text === '') return;

            const userMsg = document.createElement('div');
            userMsg.className = 'flex justify-end w-full animate-fade-in';
            userMsg.innerHTML = `<div class="bg-primary-container text-white px-6 py-4 rounded-2xl rounded-tr-none shadow-xl border border-white/10 max-w-[80%]"><p class="text-sm leading-relaxed">${text}</p></div>`;
            chatMessagesArea.appendChild(userMsg);
            chatInput.value = '';
            chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });

            setTimeout(() => {
                const typingMsg = document.createElement('div');
                typingMsg.className = 'flex gap-4 items-start max-w-[85%] animate-fade-in opacity-60';
                typingMsg.innerHTML = `<div class="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20"><span class="material-symbols-outlined text-white text-sm animate-pulse">more_horiz</span></div><div class="bg-white/5 text-white/50 px-6 py-4 rounded-2xl rounded-tl-none border border-white/10"><p class="text-sm italic">Analizando consulta estratégica...</p></div>`;
                chatMessagesArea.appendChild(typingMsg);
                chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });

                setTimeout(() => {
                    typingMsg.remove();
                    const activeAgent = document.querySelector('.agent-card.active span.font-semibold')?.textContent || 'Asistente General';
                    const response = document.createElement('div');
                    response.className = 'flex gap-4 items-start max-w-[85%] animate-fade-in';
                    response.innerHTML = `<div class="shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30"><span class="material-symbols-outlined text-primary-fixed-dim text-sm">auto_awesome</span></div><div class="bg-white/10 text-white px-6 py-4 rounded-2xl rounded-tl-none border border-white/10 shadow-lg"><p class="text-sm leading-relaxed">Entendido. Como representante de <strong>${activeAgent}</strong>, he procesado su mensaje: "${text}". Para brindarle una solución técnica o jurídica a medida, ¿podría facilitarme el contexto operativo o geográfico del caso?</p></div>`;
                    chatMessagesArea.appendChild(response);
                    chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });
                }, 1500);
            }, 600);
        });
    }

    // ── SCROLL REVEAL ──
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));

});

// ── ANIMACIONES DE ENTRADA (hero) ──
window.addEventListener('load', () => {
    document.querySelectorAll('.animate').forEach((el, index) => {
        setTimeout(() => el.classList.add('is-visible'), index * 180);
    });
});