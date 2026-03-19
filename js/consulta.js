document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnConsultar');
    const input = document.getElementById('claveInput');
    const loader = document.getElementById('loader');
    const resultadoArea = document.getElementById('resultadoArea');
    
    // CAPA 4: Referencia al Honeypot
    const hpField = document.getElementById('email_contacto_hp');

    const realizarConsulta = async (clave) => {
        // CAPA 4: Si el honeypot tiene algo, es un bot.
        if (hpField && hpField.value !== "") return;

        // CAPA 5: Validación estricta antes de disparar el fetch
        if (clave.length !== 49 || !/^\d+$/.test(clave)) {
            alert('La clave de acceso debe tener exactamente 49 dígitos numéricos.');
            return;
        }

        // CAPA 2: Verificar Turnstile (Cloudflare)
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileResponse) {
            alert('Por favor, completa la verificación de seguridad para continuar.');
            return;
        }

        // UI State: Cargando
        loader.style.display = 'block';
        resultadoArea.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';

        try {
            // Enviamos el token en los headers o params si tu API lo requiere para validar
            // Por ahora, lo validamos solo a nivel de interfaz para habilitar la búsqueda
            const response = await fetch(`https://core.kipu.ec/api/v1/public/consultar/${clave}`, {
                headers: {
                    'X-Captcha-Token': turnstileResponse // Ejemplo por si la API lo pide
                }
            });
            
            const res = await response.json();

            // Limpieza de UI
            loader.style.display = 'none';
            resultadoArea.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Comprobante';

            // Resetear el widget para la siguiente búsqueda (Seguridad proactiva)
            if (window.turnstile) turnstile.reset();

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
            loader.style.display = 'none';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Comprobante';
            alert('Error al conectar con el servidor. Por favor, intenta más tarde.');
        }
    };

    // Eventos
    btn.addEventListener('click', () => realizarConsulta(input.value.trim()));

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') realizarConsulta(input.value.trim());
    });

    // Auto-búsqueda URL
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    if (idUrl && idUrl.length === 49) {
        input.value = idUrl;
        // Pequeño delay para dejar que Turnstile cargue antes de la auto-consulta
        setTimeout(() => realizarConsulta(idUrl), 500);
    }
});
