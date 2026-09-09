const script = document.currentScript;
 
    const archivo = script ? script.dataset.json : '';

    if (!archivo) return;

    try {
        const respuesta = await fetch(archivo);
        if (!respuesta.ok) throw new Error(`No se pudo cargar ${archivo}`);

        const traducciones = await respuesta.json();
        const idioma = document.documentElement.lang.startsWith('en') ? 'en' : 'es';
        const textos = traducciones[idioma] || traducciones.es;

        document.querySelectorAll('[data-traduccion]').forEach(elemento => {
            const clave = elemento.dataset.traduccion;
            const texto = textos[clave];

            if (texto === undefined) return;

            if (elemento.matches('input, textarea')) {
                elemento.placeholder = texto;
            } else {
                elemento.textContent = texto;
            }
        });
    } catch (error) {
        console.error('Error al cargar las traducciones:', error);
    }
});
