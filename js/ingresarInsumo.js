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

