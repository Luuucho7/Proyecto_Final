nombre = document.getElementById('nombre');
estado = document.getElementById('estado');
boton = document.getElementById('boton');

boton.addEventListener('click', async (e) => {
    e.preventDefault();

    let insumo = new FormData();
    insumo.append('nombre', nombre.value);
    insumo.append('estado', estado.value);

    let respuesta = await fetch('../php/ingresarInsumo.php', {
        method: 'POST',
        body: insumo
    })
    let resultado = await respuesta.json();

    if(resultado.exito){
        alert('Insumo ingresado correctamente');
        document.getElementById('biologico').reset();
    }else{
        alert('Error al ingresar el insumo');
    }
});

clasificacion = document.getElementById('clasificacion');
pendiente = document.getElementById('pendiente');
button = document.getElementById('button');

button.addEventListener('click', async (e) => {
    e.preventDefault();

    let insumo = new FormData();
    insumo.append('clasificacion', clasificacion.value);
    insumo.append('pendiente', pendiente.value);

    let respuesta = await fetch('../php/no_biologico.php', {
        method: 'POST',
        body: insumo
    })
    let resultado = await respuesta.json();

    if(resultado.exito){
        alert('Insumo ingresado correctamente');
        document.getElementById('no_biologico').reset();
    }else{
        alert('Error al ingresar el insumo');
    }
});

persona = document.getElementById('persona');
en_curso = document.getElementById('en_curso');
tocar = document.getElementById('tocar');

tocar.addEventListener('click', async (e) => {
    e.preventDefault();

    let insumo = new FormData();
    insumo.append('persona', persona.value);
    insumo.append('en_curso', en_curso.value);

    let respuesta = await fetch('../php/organo.php', {
        method: 'POST',
        body: insumo
    })
    let resultado = await respuesta.json();

    if(resultado.exito){
        alert('Insumo ingresado correctamente');
        document.getElementById('organo').reset();
    }else{
        alert('Error al ingresar el insumo');
    }
});



const buscar = document.getElementById("buscar");
const buscar_boton = document.getElementById("buscar_boton");

buscar_boton.addEventListener("click", async (e) => {
    e.preventDefault();
    const nombreM = new FormData();
    nombreM.append('nombre', buscar.value);

    const respuesta = await fetch('../php/buscar_Ingresar.php', {
        method: 'POST',
        body: nombreM
    });

    const resultado = await respuesta.json();

    if (resultado.exito) {
        alert('Elemento encontrado correctamente', resultado.datos);
        document.getElementById('form_buscar').reset();
        nombre.value = resultado.datos.nombre;
        estado.value = resultado.datos.estado;
    }else {
        alert('Error al realizar la modificación');
    }
})

const mod_b = document.getElementById("mod_b");
mod_b.addEventListener("click", async (e) => {
    e.preventDefault();
    const nombreM = new FormData();
    nombreM.append('nombre', nombre.value);
    nombreM.append('estado', estado.value);
    
    const respuesta = await fetch('../php/modificar_biologico.php', {
        method: 'POST',
        body: nombreM
    });

    const resultado = await respuesta.json();
    
    if (resultado.exito) {
        alert('Elemento modificado correctamente');
        document.getElementById('form_buscar').reset();
    }else {
        alert('Error al realizar la modificación');
    }

})

   const encontrar_nobiologico = document.getElementById("encontrar");
const buscar_boton_no = document.getElementById("buscar_boton_nobiologico");

buscar_boton_no.addEventListener("click", async (e) => {
    e.preventDefault();
    const datosBusqueda = new FormData();
    datosBusqueda.append('clasificacion', encontrar_nobiologico.value);

    const respuesta = await fetch('../php/buscar_noBiologico.php', {
        method: 'POST',
        body: datosBusqueda
    });

    const resultado = await respuesta.json();

     if (resultado.exito) {
        document.getElementById('form_noB').reset();
        clasificacion.value = resultado.datos.clasificacion;
        pendiente.value = resultado.datos.pendiente;
    } else {
        alert('Error al realizar la modificación');
    }
});