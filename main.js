document.addEventListener('DOMContentLoaded', () => {

  // ── MODAL CONTACTO ──
  const modal          = document.getElementById('contactModal');
  const openModalBtns  = document.querySelectorAll('#openModal, #openModalMobile, .cta-button');
  const closeModalBtn  = document.getElementById('closeModal');
  const contactForm    = document.getElementById('contactForm');
  const formSuccess    = document.getElementById('formSuccess');
  const originalDisplay = contactForm ? getComputedStyle(contactForm).display : 'block';

  if (modal) modal.style.display = 'none';

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation(); e.preventDefault();
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
      if (contactForm) contactForm.style.display = originalDisplay;
      if (formSuccess) formSuccess.style.display = 'none';
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
      if (contactForm) { contactForm.reset(); contactForm.style.display = originalDisplay; }
      if (formSuccess) formSuccess.style.display = 'none';
    });
  }

  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
      if (contactForm) { contactForm.reset(); contactForm.style.display = originalDisplay; }
      if (formSuccess) formSuccess.style.display = 'none';
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      fetch('https://formspree.io/f/maqqvnvq', {
        method: 'POST', body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(r => {
        if (r.ok) {
          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.style.display = 'block';
          contactForm.reset();
        } else { alert('Hubo un error al enviar el formulario.'); }
      }).catch(() => alert('Error de conexión. Intenta más tarde.'));
    });
  }

  // ────────────────────────────────────────────────────────────
  // ── CHAT ──
  // ────────────────────────────────────────────────────────────
  const chatWrapper      = document.getElementById('chat-interface-wrapper');
  const chatInput        = document.getElementById('chat-input');
  const chatForm         = document.getElementById('chat-form');
  const chatMessagesArea = document.getElementById('chat-messages-area');
  const agentCards       = document.querySelectorAll('.agent-card');

  if (!chatWrapper || !chatInput || !chatForm) return;

  // ── FLUJOS POR ESPECIALISTA ──────────────────────────────────
  // Cada uno tiene intro propia y 4 preguntas específicas de su área.
  const FLUJOS = {
    'Justo': {
      nombre : 'Justo',
      area   : 'Derecho Civil y Peritajes',
      email  : 'hola@izate.es',
      intro  : 'Hola, soy Justo. Me encargo del área de Derecho Civil y Peritajes. Para orientarte bien necesito hacerte unas preguntas sobre tu caso — no tardaremos más de dos minutos. ¿Empezamos?',
      preguntas: [
        '¿Qué tipo de asunto legal tienes? Por ejemplo: herencia, contrato, divorcio, custodia, pensión alimenticia, peritaje judicial...',
        '¿Hay actualmente algún procedimiento judicial en curso o todavía estamos en una fase previa al juzgado?',
        '¿Cuánto tiempo llevas aproximadamente con este problema o desde que ocurrió el hecho?',
        '¿Tienes documentación relevante? Por ejemplo: contratos, escrituras, sentencias previas, informes... No hace falta que la compartas ahora, solo quiero saber si existe.'
      ]
    },
    'Virginia': {
      nombre : 'Virginia',
      area   : 'Financiación y Reclamaciones Bancarias',
      email  : 'hola@izate.es',
      intro  : 'Hola, soy Virginia. Soy especialista en financiación y reclamaciones bancarias. Antes de que hablemos, necesito entender un poco tu situación. Son solo cuatro preguntas rápidas. ¿Te parece bien?',
      preguntas: [
        '¿Qué tipo de producto financiero está involucrado? Por ejemplo: tarjeta revolving, hipoteca, préstamo personal, microcrédito, financiación de empresa...',
        '¿Con qué entidad bancaria o financiera tienes este contrato o producto?',
        '¿Cuánto tiempo llevas pagando este producto o cuándo ocurrió el problema que quieres reclamar?',
        '¿Tienes el contrato o algún documento del producto disponible, aunque sea en papel? No es imprescindible ahora, pero me ayuda saberlo.'
      ]
    },
    'Carlos': {
      nombre : 'Carlos',
      area   : 'Tasación e Inmobiliario',
      email  : 'hola@izate.es',
      intro  : 'Hola, soy Carlos. Me encargo de tasaciones e inmobiliario. Para darte la orientación más precisa posible, voy a hacerte cuatro preguntas sobre lo que necesitas. ¿Arrancamos?',
      preguntas: [
        '¿Qué tipo de inmueble es? Por ejemplo: piso, casa unifamiliar, local comercial, terreno, nave industrial, garaje...',
        '¿Para qué necesitas nuestros servicios? Por ejemplo: compra, venta, alquiler, herencia, divorcio, refinanciación, proceso judicial, inversión...',
        '¿Dónde está ubicado el inmueble, en qué ciudad o municipio?',
        '¿Hay algún plazo urgente o fecha límite que debamos tener en cuenta?'
      ]
    },
    'César': {
      nombre : 'César',
      area   : 'Arquitectura y Construcción',
      email  : 'hola@izate.es',
      intro  : 'Hola, soy César, del área de arquitectura y construcción. Para entender bien tu caso antes de que hablemos, voy a hacerte cuatro preguntas rápidas. ¿Listo?',
      preguntas: [
        '¿Qué tipo de proyecto o problema tienes? Por ejemplo: obra nueva, reforma, licencia de actividad, peritaje técnico, vicios ocultos, problemas estructurales...',
        '¿En qué fase se encuentra actualmente? Por ejemplo: idea inicial, proyecto en curso, obra ya terminada con problemas detectados...',
        '¿Existe algún conflicto con un constructor, promotor o con la administración pública relacionado con esto?',
        '¿Tienes documentación del proyecto o de los problemas detectados? Planos, fotos, presupuestos, informes... (de nuevo, no hace falta ahora, solo si existe).'
      ]
    },
    'Asistente General': {
      nombre : 'Asistente General',
      area   : 'Consulta General',
      email  : 'hola@izate.es',
      intro  : 'Hola 👋 Soy la asistente virtual de Izate Consulting 360. Voy a hacerte unas preguntas para entender tu caso y asignarte al especialista más adecuado.',
      preguntas: [
        '¿En qué área necesitas ayuda? Por ejemplo: reclamación bancaria, derecho civil, tasación, inmobiliaria, arquitectura o construcción...',
        '¿Puedes describir brevemente tu situación?',
        '¿Tienes algún plazo urgente o documentación relacionada con el caso?'
      ]
    }
  };

  const AGENTES_MAP = {
    'justo':     'Justo',
    'virginia': 'Virginia',
    'carlos':   'Carlos',
    'césar':    'César',
    'cesar':    'César'
  };

  const PALABRAS_CLAVE = {
    'Justo':     ['civil','herencia','contrato','separacion','divorcio','particular','judicial','extrajudicial','pericial','informe pericial','perito','demanda','litigio','pleito','testamento','custodia','pension'],
    'Virginia': ['financiacion','hipoteca','prestamo','promotor','inversion','financiero','capital','deuda','credito','banco','fondos','financiar','dinero','pago','cuota','revolving','microcredito','interes abusivo','clausula suelo'],
    'Carlos':   ['tasacion','valoracion','inmueble','compraventa','compra','venta','alquiler','arrendamiento','agente inmobiliario','propiedad','piso','casa','local','terreno','finca','solar'],
    'César':    ['arquitectura','construccion','obra','licencia','reforma','proyecto','peritaje tecnico','normativa','arquitecto','edificio','estructura','planos','urbanismo','vicio oculto','grieta']
  };

  // ── ESTADO ──
  let estado         = 'inicio';
  let flujoActivo    = null;
  let preguntaIdx    = 0;
  let respuestas     = [];          // [{pregunta, respuesta}]
  let datosContacto  = { nombre: '', telefono: '', correo: '' };

  // ── UTILIDADES ──
  function normalizar(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function detectarEspecialista(texto) {
    const t = normalizar(texto);
    for (const [nombre, palabras] of Object.entries(PALABRAS_CLAVE)) {
      if (palabras.some(p => t.includes(normalizar(p)))) return nombre;
    }
    return 'Asistente General';
  }

  // ── UI ──
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

  function typing(cb, ms = 900) {
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
    setTimeout(() => { d.remove(); cb(); }, ms);
  }

  function activarTarjetaAgente(nombre) {
    agentCards.forEach(card => {
      const n = card.querySelector('span.font-semibold')?.textContent;
      card.classList.toggle('active', n === nombre);
    });
  }

  function mostrarBotonNuevaConsulta() {
    setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'flex justify-center w-full my-2 animate-fade-in';
      d.innerHTML = `<button id="nueva-consulta" class="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-2.5 rounded-full border border-white/20 transition-all">¿Tienes otra consulta? Iniciar de nuevo →</button>`;
      chatMessagesArea.appendChild(d);
      chatMessagesArea.scrollTo({ top: chatMessagesArea.scrollHeight, behavior: 'smooth' });
      document.getElementById('nueva-consulta').addEventListener('click', resetChat);
    }, 1000);
  }

  function resetChat() {
    estado        = 'inicio';
    flujoActivo   = null;
    preguntaIdx   = 0;
    respuestas    = [];
    datosContacto = { nombre: '', telefono: '', correo: '' };
    chatInput.disabled     = false;
    chatInput.placeholder  = 'En qué podemos ayudarte...';
    typing(() => addBot('Hola de nuevo 👋 ¿En qué más podemos ayudarte? Cuéntame tu consulta o elige un especialista.'), 600);
  }

  // ── EMAIL con resumen completo ──
  function buildResumen() {
    let txt = `ESPECIALISTA: ${flujoActivo.nombre} — ${flujoActivo.area}\n\n`;
    txt += 'CASO (preguntas y respuestas):\n';
    respuestas.forEach(r => { txt += `\nP: ${r.pregunta}\nR: ${r.respuesta}\n`; });
    txt += `\nCONTACTO:\nNombre: ${datosContacto.nombre}\nTeléfono: ${datosContacto.telefono}\nCorreo: ${datosContacto.correo}`;
    return txt;
  }

  function enviarEmail() {
    emailjs.send('service_q79s807', 'template_er2uci3', {
      especialista:        flujoActivo.nombre,
      correo_especialista: flujoActivo.email,
      problema:            buildResumen(),
      nombre:              datosContacto.nombre,
      telefono:            datosContacto.telefono,
      correo_usuario:      datosContacto.correo,
    }).then(() => {
      typing(() => {
        addBot(`✅ Listo, <strong>${datosContacto.nombre}</strong>. He enviado el resumen completo de tu caso a <strong>${flujoActivo.nombre}</strong>. En breve se pondrá en contacto contigo. ¡Gracias por confiar en Izate!`);
        mostrarBotonNuevaConsulta();
      });
    }).catch(err => {
      console.error('EmailJS error:', err);
      typing(() => addBot('Hubo un problema al enviar tu consulta. Por favor, contáctanos directamente en <strong>hola@izate.es</strong>'));
    });
  }

  // ── ARRANCAR FLUJO DEL ESPECIALISTA ──
  function iniciarFlujo(nombreEspecialista) {
    flujoActivo = FLUJOS[nombreEspecialista] || FLUJOS['Asistente General'];
    preguntaIdx = 0;
    respuestas  = [];
    estado      = 'preguntas';
    activarTarjetaAgente(flujoActivo.nombre);

    // Intro del especialista → pausa → primera pregunta
    typing(() => {
      addBot(flujoActivo.intro);
      setTimeout(() => {
        typing(() => addBot(flujoActivo.preguntas[0]), 700);
      }, 600);
    }, 800);
  }

  // ── PROCESAR MENSAJE DEL USUARIO ──
  const ACUSES = ['Entendido.', 'Perfecto.', 'De acuerdo.', 'Anotado.', 'Gracias por la información.', 'Claro.'];
  function acuse() { return ACUSES[Math.floor(Math.random() * ACUSES.length)]; }

  function procesarMensaje(texto) {
    const t = normalizar(texto);

    // En fases de contacto no redirigimos aunque se mencione un agente
    const fasesContacto = ['pedir_nombre', 'pedir_telefono', 'pedir_correo', 'enviado'];

    if (!fasesContacto.includes(estado)) {
      const nombreDetectado = Object.keys(AGENTES_MAP).find(n => t.includes(n));
      if (nombreDetectado) {
        iniciarFlujo(AGENTES_MAP[nombreDetectado]);
        return;
      }
    }

    switch (estado) {

      // ── INICIO: detectar intención y arrancar flujo ──
      case 'inicio': {
        const saludos = ['hola','buenas','buenos dias','buenas tardes','buenas noches','hey','hi','ola','como estas','que tal','gracias','ok','vale','si','no','claro'];
        if (saludos.some(s => t.trim() === normalizar(s))) {
          typing(() => addBot('Hola 👋 Encantada de atenderte. ¿Cuál es tu consulta? Cuéntame brevemente y te asigno al especialista más adecuado.'));
          break;
        }
        iniciarFlujo(detectarEspecialista(texto));
        break;
      }

      // ── PREGUNTAS DEL ESPECIALISTA ──
      case 'preguntas': {
        // Guardar respuesta
        respuestas.push({ pregunta: flujoActivo.preguntas[preguntaIdx], respuesta: texto });
        preguntaIdx++;

        if (preguntaIdx < flujoActivo.preguntas.length) {
          // Siguiente pregunta con acuse natural
          typing(() => addBot(`${acuse()} ${flujoActivo.preguntas[preguntaIdx]}`), 850);
        } else {
          // Terminaron las preguntas → pedir datos
          estado = 'pedir_nombre';
          typing(() => addBot(`${acuse()} Ya tengo una buena visión de tu caso. Ahora solo necesito tus datos para que <strong>${flujoActivo.nombre}</strong> pueda contactarte. ¿Cuál es tu nombre completo?`), 900);
        }
        break;
      }

      // ── DATOS DE CONTACTO ──
      case 'pedir_nombre': {
        if (texto.trim().split(/\s+/).length < 2) {
          typing(() => addBot('Para una atención más personalizada, ¿podrías indicarme tu nombre y apellido?'));
          break;
        }
        datosContacto.nombre = texto.trim();
        estado = 'pedir_telefono';
        typing(() => addBot(`Gracias, <strong>${datosContacto.nombre}</strong>. ¿Cuál es tu número de teléfono?`));
        break;
      }

      case 'pedir_telefono': {
        if (!/[\d\s\+\-\.]{6,}/.test(texto)) {
          typing(() => addBot('No reconozco ese número. ¿Podrías escribir tu teléfono de contacto?'));
          break;
        }
        datosContacto.telefono = texto.trim();
        estado = 'pedir_correo';
        typing(() => addBot('Perfecto. Por último, ¿tu correo electrónico?'));
        break;
      }

      case 'pedir_correo': {
        if (!/\S+@\S+\.\S+/.test(texto)) {
          typing(() => addBot('Ese correo no parece válido. ¿Podrías escribirlo de nuevo? Ejemplo: <em>nombre@correo.com</em>'));
          break;
        }
        datosContacto.correo = texto.trim();
        estado = 'enviado';
        chatInput.disabled    = true;
        chatInput.placeholder = 'Consulta enviada';
        typing(() => {
          addBot(`Un momento, estoy enviando el resumen de tu caso a <strong>${flujoActivo.nombre}</strong>...`);
          setTimeout(enviarEmail, 1200);
        });
        break;
      }
    }
  }

  // ── EXPANDIR CHAT ──
  const expandChat = () => {
    if (chatWrapper.classList.contains('expanded')) return;
    chatWrapper.classList.add('expanded');
    setTimeout(() => {
      chatWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      chatInput.focus();
      typing(() => addBot('Hola 👋 Soy la asistente virtual de <strong>Izate Consulting 360</strong>. Si ya sabes tu área, elige un especialista en el panel. Si no, cuéntame brevemente tu caso y te asigno al más adecuado.'), 600);
    }, 300);
  };

  chatInput.addEventListener('focus', expandChat);
  chatInput.addEventListener('click', expandChat);

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const texto = chatInput.value.trim();
    if (!texto || estado === 'enviado') return;
    addUser(texto);
    chatInput.value = '';
    procesarMensaje(texto);
  });

  // ── CLICK EN TARJETA DE AGENTE ──
  agentCards.forEach(card => {
    card.addEventListener('click', () => {
      agentCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const nombre = card.querySelector('span.font-semibold')?.textContent;
      if (!nombre) return;

      if (!chatWrapper.classList.contains('expanded')) {
        chatWrapper.classList.add('expanded');
        setTimeout(() => chatWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }

      if (nombre === 'Asistente General') {
        if (estado !== 'enviado') {
          flujoActivo = null; estado = 'inicio';
          typing(() => addBot('Hola 👋 Cuéntame tu caso y te asigno al especialista más adecuado.'));
        }
        return;
      }

      iniciarFlujo(nombre);
    });
  });

  // ── SCROLL REVEAL ──
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-reveal').forEach(el => revealObserver.observe(el));

  // ── COOKIE NOTICE ──
  if (!localStorage.getItem('cookies-ok')) {
    setTimeout(() => {
      const notice = document.getElementById('cookie-notice');
      if (!notice) return;
      notice.style.display = 'flex';
      setTimeout(() => notice.classList.add('visible'), 10);
      const cerrar = () => { notice.classList.remove('visible'); localStorage.setItem('cookies-ok', '1'); };
      document.getElementById('cookie-btn').addEventListener('click', cerrar);
      setTimeout(cerrar, 20000);
    }, 1500);
  }

}); // fin DOMContentLoaded

window.addEventListener('load', () => {
  document.querySelectorAll('.animate').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), i * 180);
  });
});