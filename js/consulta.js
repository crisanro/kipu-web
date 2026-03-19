document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnConsultar');
    const input = document.getElementById('claveInput');
    const loader = document.getElementById('loader');
    const resultadoArea = document.getElementById('resultadoArea');
    const hpField = document.getElementById('email_contacto_hp');

    const realizarConsulta = async (clave) => {
        // 1. CAPA 4: Honeypot (Trampa para bots)
        if (hpField && hpField.value !== "") {
            console.warn("Consulta bloqueada: Honeypot detectado.");
            return;
        }

        // 2. CAPA 5: Validación de formato
        if (clave.length !== 49 || !/^\d+$/.test(clave)) {
            alert('La clave de acceso debe tener exactamente 49 dígitos numéricos.');
            return;
        }

        // 3. CAPA 2: Obtener token de Turnstile
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;
        
        if (!turnstileResponse) {
            alert('Por favor, completa la verificación de seguridad (reCAPTCHA/Turnstile).');
            return;
        }

        // --- UI STATE: Cargando ---
        loader.style.display = 'block';
        resultadoArea.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';

        try {
            console.log("Enviando petición POST a core.kipu.ec...");

            const response = await fetch(`https://core.kipu.ec/api/v1/public/consultar/${clave}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    captchaToken: turnstileResponse,
                    hpValue: hpField ? hpField.value : ""
                })
            });

            // Si la respuesta no es OK (ej. 403, 404, 500), lanzamos error para caer al catch
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje_usuario || `Error del servidor: ${response.status}`);
            }

            const res = await response.json();
            console.log("Respuesta recibida:", res);

            // --- PROCESAR RESULTADO ---
            loader.style.display = 'none';
            resultadoArea.style.display = 'block';

            const badge = document.getElementById('statusBadge');
            const msgBox = document.getElementById('mensajeUsuario');
            const descargas = document.getElementById('descargasArea');

            if (res.success) {
                badge.className = 'status-badge status-autorizado';
                badge.innerText = 'Autorizado';
                document.getElementById('emisorNombre').innerText = res.data.cabecera.emisor;
                document.getElementById('infoFactura').innerText = `Comprobante: ${res.data.cabecera.nro} | Total: $${res.data.totales.total}`;
                
                msgBox.style.display = 'none';
                descargas.style.display = 'flex';
                document.getElementById('linkPdf').href = res.data.links.pdf;
                document.getElementById('linkXml').href = res.data.links.xml;
            } else {
                const esProceso = ['RECIBIDO', 'EN PROCESO'].includes(res.estado);
                badge.className = esProceso ? 'status-badge status-proceso' : 'status-badge status-error';
                badge.innerText = res.estado || 'Error';
                
                document.getElementById('emisorNombre').innerText = 'Información del Comprobante';
                document.getElementById('infoFactura').innerText = `Clave: ${clave}`;
                
                msgBox.style.display = 'block';
                msgBox.style.background = esProceso ? '#FFFBEB' : '#FEF2F2';
                msgBox.style.color = esProceso ? '#92400E' : '#991B1B';
                msgBox.innerText = res.mensaje_usuario;
                
                descargas.style.display = 'none';
            }

        } catch (error) {
            console.error("Error en la petición fetch:", error);
            loader.style.display = 'none';
            alert(error.message || 'Error al conectar con el servidor. Intenta más tarde.');
        } finally {
            // Reestablecer botón y Captcha
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Comprobante';
            if (window.turnstile) turnstile.reset();
        }
    };

    // --- EVENTOS ---
    btn.addEventListener('click', () => realizarConsulta(input.value.trim()));

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') realizarConsulta(input.value.trim());
    });

    // Auto-búsqueda URL (?id=...)
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    if (idUrl && idUrl.length === 49) {
        input.value = idUrl;
        setTimeout(() => realizarConsulta(idUrl), 800); // Esperar a que Turnstile cargue
    }
});
