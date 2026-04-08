document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnConsultar');
    const btnWS = document.getElementById('btnWhatsApp'); // Nuevo
    const input = document.getElementById('claveInput');
    const loader = document.getElementById('loader');
    const resultadoArea = document.getElementById('resultadoArea');
    const hpField = document.getElementById('email_contacto_hp');

    // --- FUNCIÓN: Validar Input para habilitar botones ---
    const validarInput = () => {
        const valor = input.value.trim();
        const esValido = valor.length === 49 && /^\d+$/.test(valor);
        
        if (esValido) {
            btn.disabled = false;
            btn.classList.remove('btn-inactive');
            btnWS.style.display = 'block'; // Mostrar botón WhatsApp
        } else {
            btn.disabled = true;
            btn.classList.add('btn-inactive');
            btnWS.style.display = 'none'; // Ocultar si no es válido
        }
    };

    // --- FUNCIÓN: Ir a WhatsApp ---
    const enviarWhatsApp = () => {
        const clave = input.value.trim();
        const telefono = "593987413333";
        const mensaje = encodeURIComponent(`Descargar ${clave}`);
        const url = `https://wa.me/${telefono}?text=${mensaje}`;
        window.open(url, '_blank');
    };

    const realizarConsulta = async (clave) => {
        // (Mantenemos tu lógica de validación interna y Honeypot igual...)
        if (hpField && hpField.value !== "") return;
        
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileResponse) {
            alert('Por favor, completa la verificación de seguridad.');
            return;
        }

        // --- UI STATE: Cargando ---
        loader.style.display = 'block';
        resultadoArea.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';

        try {
            const response = await fetch(`https://core.kipu.ec/api/v1/public/consultar/${clave}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    captchaToken: turnstileResponse,
                    hpValue: hpField ? hpField.value : ""
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje_usuario || `Error: ${response.status}`);
            }

            const res = await response.json();
            
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
                // ... (Lógica de error que ya tenías)
            }

        } catch (error) {
            console.error(error);
            loader.style.display = 'none';
            alert(error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Comprobante';
            if (window.turnstile) turnstile.reset();
        }
    };

    // --- EVENTOS ---
    input.addEventListener('input', validarInput); // Valida mientras escribes

    btn.addEventListener('click', () => realizarConsulta(input.value.trim()));
    
    btnWS.addEventListener('click', enviarWhatsApp); // Evento WhatsApp

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !btn.disabled) realizarConsulta(input.value.trim());
    });

    // --- MODIFICACIÓN: Auto-rellenado SIN auto-consulta ---
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    if (idUrl && idUrl.length === 49) {
        input.value = idUrl;
        validarInput(); // Solo habilita el botón, no dispara la consulta
    }
});
