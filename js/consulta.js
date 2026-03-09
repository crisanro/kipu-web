document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnConsultar');
    const input = document.getElementById('claveInput');
    const loader = document.getElementById('loader');
    const resultadoArea = document.getElementById('resultadoArea');

    // Función principal de consulta
    const realizarConsulta = async (clave) => {
        if (clave.length !== 49 || !/^\d+$/.test(clave)) {
            alert('Por favor, ingresa una clave válida de 49 dígitos numéricos.');
            return;
        }

        // UI State: Cargando
        loader.style.display = 'block';
        resultadoArea.style.display = 'none';
        btn.disabled = true;

        try {
            const response = await fetch(`https://core.kipu.ec/api/v1/public/consultar/${clave}`);
            const res = await response.json();

            loader.style.display = 'none';
            resultadoArea.style.display = 'block';
            btn.disabled = false;

            const badge = document.getElementById('statusBadge');
            const msgBox = document.getElementById('mensajeUsuario');
            const descargas = document.getElementById('descargasArea');

            if (res.success) {
                // CASO AUTORIZADO
                badge.className = 'status-badge status-autorizado';
                badge.innerText = 'Autorizado';
                document.getElementById('emisorNombre').innerText = res.data.cabecera.emisor;
                document.getElementById('infoFactura').innerText = `Comprobante: ${res.data.cabecera.nro} | Total: $${res.data.totales.total}`;
                
                msgBox.style.display = 'none';
                descargas.style.display = 'flex';
                document.getElementById('linkPdf').href = res.data.links.pdf;
                document.getElementById('linkXml').href = res.data.links.xml;
            } else {
                // CASOS NO AUTORIZADOS (RECIBIDO, DEVUELTA, etc)
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
            alert('Error al conectar con el servidor. Por favor, intenta más tarde.');
        }
    };

    // Evento Clic
    btn.addEventListener('click', () => realizarConsulta(input.value.trim()));

    // Soporte para Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') realizarConsulta(input.value.trim());
    });

    // AUTO-BUSQUEDA: Si viene un ID en la URL (?id=...)
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    if (idUrl && idUrl.length === 49) {
        input.value = idUrl;
        realizarConsulta(idUrl);
    }
});