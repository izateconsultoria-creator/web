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

    // ── CHAT CON BOT Y EMAILJS ──
    const chatWrapper      = document.getElementById('chat-interface-wrapper');
    const chatInput        = document.getElementById('chat-input');
    const chatForm         = document.getElementById('chat-form');
    const chatMessagesArea = document.getElementById('chat-messages-area');
    const agentCards       = document.querySelectorAll('.agent-card');

    if (chatWrapper && chatInput && chatForm) {

        let estado  = 'inicio';
        let consulta = { problema: '', especialista: '', nombre: '', telefono: '', correo: '' };

        const correosEspecialistas = {
            'Axel':             'hola@izate.es',
            'Virginia':         'hola@izate.es',
            'Carlos':           'hola@izate.es',
            'César':            'hola@izate.es',
            'Asistente General':'hola@izate.es',
        };

        function normalizar(texto) {
            return texto.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        }

        const palabrasClave = {
            'Axel':     ['civil','herencia','contrato','separacion','divorcio','particular','judicial','extrajudicial','pericial','informe pericial','perito','demanda','litigio','pleito','testamento','custodia','pension'],
            'Virginia': ['financiacion','hipoteca','prestamo','promotor','inversion','financiero','capital','deuda','credito','banco','fondos','financiar','dinero','pago','cuota'],
            'Carlos':   ['tasacion','valoracion','inmueble','compraventa','compra','venta','alquiler','arrendamiento','agente inmobiliario','propiedad','piso','casa','local','terreno','finca','solar'],
            'César':    ['arquitectura','construccion','obra','licencia','reforma','proyecto','peritaje tecnico','normativa','arquitecto','edificio','estructura','planos','urbanismo'],
        };

        function detectarEspecialista(texto) {
            const t = normalizar(texto);
            for (const [nombre, palabras] of Object.entries(palabrasClave)) {
                if (palabras.some(p => t.includes(normalizar(p)))) return nombre;
            }
            return 'Asistente General';
        }

        function addBot(texto) {
            const d = document.createElement('div');
            d.className = 'flex gap-4 items-start max-w-[85%] animate-fade-in';
            d.innerHTML = `
                <div class="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span class="material-symbols-outlined text-white text-sm">support_agent</span>
                </div>
                <div class="bg-white/10 text-white px-6 py-4 rounded-2xl rounded-tl-none border border-white/10 shadow-lg">
                    <p class="text-sm leading-relaxed">${texto}</p>
                </div>`;
            chatMessagesArea.appendChild(d);
            chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });
        }

        function addUser(texto) {
            const d = document.createElement('div');
            d.className = 'flex justify-end w-full animate-fade-in';
            d.innerHTML = `
                <div class="bg-primary-container text-white px-6 py-4 rounded-2xl rounded-tr-none shadow-xl border border-white/10 max-w-[80%]">
                    <p class="text-sm leading-relaxed">${texto}</p>
                </div>`;
            chatMessagesArea.appendChild(d);
            chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });
        }

        function typing(cb) {
            const d = document.createElement('div');
            d.id = 'typing-indicator';
            d.className = 'flex gap-4 items-start max-w-[85%] animate-fade-in opacity-60';
            d.innerHTML = `
                <div class="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span class="material-symbols-outlined text-white text-sm animate-pulse">more_horiz</span>
                </div>
                <div class="bg-white/5 text-white/50 px-6 py-4 rounded-2xl rounded-tl-none border border-white/10">
                    <p class="text-sm italic">Escribiendo...</p>
                </div>`;
            chatMessagesArea.appendChild(d);
            chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });
            setTimeout(() => { d.remove(); cb(); }, 900);
        }

        function mostrarBotonNuevaConsulta() {
            setTimeout(() => {
                const d = document.createElement('div');
                d.className = 'flex justify-center w-full my-2 animate-fade-in';
                d.innerHTML = `<button id="nueva-consulta" class="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-2.5 rounded-full border border-white/20 transition-all">¿Tienes otra consulta? Iniciar de nuevo →</button>`;
                chatMessagesArea.appendChild(d);
                chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });

                document.getElementById('nueva-consulta').addEventListener('click', () => {
                    estado = 'inicio';
                    consulta = { problema: '', especialista: '', nombre: '', telefono: '', correo: '' };
                    chatInput.disabled = false;
                    chatInput.placeholder = 'En qué podemos ayudarte...';
                    d.remove();
                    typing(() => addBot('Hola de nuevo 👋 ¿En qué más podemos ayudarte? Cuéntame tu consulta o selecciona un especialista.'));
                });
            }, 1000);
        }

        function enviarEmail() {
            emailjs.send('service_q79s807', 'template_er2uci3', {
                especialista:        consulta.especialista,
                correo_especialista: correosEspecialistas[consulta.especialista],
                problema:            consulta.problema,
                nombre:              consulta.nombre,
                telefono:            consulta.telefono,
                correo_usuario:      consulta.correo,
            }).then(() => {
                typing(() => {
                    addBot(`✅ Tu consulta ha sido enviada a <strong>${consulta.especialista}</strong>. En breve se pondrá en contacto contigo. ¡Gracias, ${consulta.nombre}!`);
                    mostrarBotonNuevaConsulta();
                });
            }).catch((err) => {
                console.error('EmailJS error:', JSON.stringify(err));
                typing(() => addBot('Hubo un problema al enviar tu consulta. Por favor, contáctanos directamente en hola@izate.es'));
            });
        }

        function procesarMensaje(texto) {
            switch (estado) {
                case 'inicio':
    // Validación mínima
    const soloRuido = /^[^a-záéíóúüña-z\s]{0,}$/i.test(texto);
    const muyCorto  = normalizar(texto).replace(/\s/g,'').length < 4;
    const sinVocales = (texto.match(/[aeiouáéíóúü]/gi) || []).length === 0;

    if (muyCorto || soloRuido || sinVocales) {
        typing(() => addBot('No me ha quedado claro. ¿Podrías ser más específico con tu consulta? Por ejemplo: <em>"necesito tasar un piso"</em> o <em>"tengo un problema con una herencia"</em>.'));
        break;
    }

    consulta.problema = texto;
    if (!consulta.especialista) {
        consulta.especialista = detectarEspecialista(texto);
    }
    estado = 'pedir_nombre';
    typing(() => addBot(`Entendido. Tomaré tus datos para que <strong>${consulta.especialista}</strong> pueda contactarte. ¿Cuál es tu nombre completo?`));
    break;

                case 'pedir_nombre':
                    consulta.nombre = texto;
                    estado = 'pedir_telefono';
                    typing(() => addBot(`Gracias, <strong>${consulta.nombre}</strong>. ¿Tu número de teléfono?`));
                    break;

                case 'pedir_telefono':
                    consulta.telefono = texto;
                    estado = 'pedir_correo';
                    typing(() => addBot('Perfecto. Por último, ¿tu correo electrónico?'));
                    break;

                case 'pedir_correo':
                    consulta.correo = texto;
                    estado = 'enviado';
                    chatInput.disabled    = true;
                    chatInput.placeholder = 'Consulta enviada';
                    typing(() => {
                        addBot(`Un momento, estoy notificando a <strong>${consulta.especialista}</strong>...`);
                        setTimeout(enviarEmail, 1200);
                    });
                    break;
            }
        }

        const expandChat = () => {
            if (!chatWrapper.classList.contains('expanded')) {
                chatWrapper.classList.add('expanded');
                setTimeout(() => {
                    chatWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    chatInput.focus();
                    if (estado === 'inicio') {
                        typing(() => addBot('Hola 👋 Soy la asistente virtual de <strong>Izate Consulting 360</strong>. Si conoces tu área, selecciona un especialista en el panel. Si no, cuéntame brevemente tu caso y te asigno al más adecuado.'));
                    }
                }, 300);
            }
        };

        chatInput.addEventListener('focus', expandChat);
        chatInput.addEventListener('click', expandChat);

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = chatInput.value.trim();
            if (!texto || estado === 'enviado') return;
            addUser(texto);
            chatInput.value = '';
            procesarMensaje(texto);
        });

        agentCards.forEach(card => {
            card.addEventListener('click', () => {
                agentCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const nombre = card.querySelector('span.font-semibold')?.textContent;
                if (nombre && nombre !== 'Asistente General') {
                    consulta.especialista = nombre;
                    if (estado === 'inicio') {
                        typing(() => addBot(`Perfecto, hablarás con <strong>${nombre}</strong>. Cuéntame con detalle tu caso.`));
                    }
                }
            });
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

    // ── COOKIE NOTICE ──
    if (!localStorage.getItem('cookies-ok')) {
        setTimeout(() => {
            const notice = document.getElementById('cookie-notice');
            notice.style.display = 'flex';
            setTimeout(() => notice.classList.add('visible'), 10);

            const cerrar = () => {
                notice.classList.remove('visible');
                localStorage.setItem('cookies-ok', '1');
            };

            document.getElementById('cookie-btn').addEventListener('click', cerrar);
            setTimeout(cerrar, 20000);
        }, 1500);
    }

}); // ← cierre del DOMContentLoaded

// ── ANIMACIONES DE ENTRADA (hero) ──
window.addEventListener('load', () => {
    document.querySelectorAll('.animate').forEach((el, index) => {
        setTimeout(() => el.classList.add('is-visible'), index * 180);
    });
});


