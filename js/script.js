// Guardamos los elementos del HTML que vamos a usar
const selector = document.getElementById('selectorLenguaje');
const resultado = document.getElementById('resultado');
const botonAccion = document.getElementById('botonAccion');

// Lenguajes disponibles y el color del puntito de cada uno
const lenguajes = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    PHP: '#4F5D95',
};

// Llenamos el selector con los lenguajes
Object.keys(lenguajes).forEach((nombre) => {
    const opcion = document.createElement('option');
    opcion.value = nombre;
    opcion.textContent = nombre;
    selector.appendChild(opcion);
});

//Funciones para mostrar cada estado

function mostrarVacio() {
    resultado.className = 'resultado vacio';
    resultado.textContent = 'Por favor selecciona un lenguaje';
    botonAccion.classList.add('oculto');
}

function mostrarCargando() {
    resultado.className = 'resultado cargando';
    resultado.textContent = 'Cargando, por favor espere...';
    botonAccion.classList.add('oculto');
}

function mostrarError() {
    resultado.className = 'resultado error';
    resultado.textContent = 'Error al obtener los repositorios';
    // El botón sirve para reintentar
    botonAccion.textContent = 'Clic para reintentar';
    botonAccion.classList.add('rojo');
    botonAccion.classList.remove('oculto');
}

function mostrarRepositorio(repo, lenguaje) {
    resultado.className = 'resultado repositorio';
    resultado.innerHTML = '';   // limpiamos lo que hubiera antes

    // Nombre (con enlace al repositorio)
    const titulo = document.createElement('h2');
    const enlace = document.createElement('a');
    enlace.href = repo.html_url;
    enlace.target = '_blank';
    enlace.textContent = repo.name;
    titulo.appendChild(enlace);

    // Descripción (algunos repositorios no tienen)
    const descripcion = document.createElement('p');
    descripcion.textContent = repo.description || 'Sin descripción';

    // Fila de datos: lenguaje, estrellas, forks e issues abiertos
    const datos = document.createElement('div');
    datos.classList.add('datos');

    const punto = document.createElement('span');
    punto.classList.add('punto');
    punto.style.backgroundColor = lenguajes[lenguaje];

    const spanLenguaje = document.createElement('span');
    spanLenguaje.append(punto, lenguaje);

    const estrellas = document.createElement('span');
    estrellas.textContent = '⭐ ' + repo.stargazers_count.toLocaleString();

    const forks = document.createElement('span');
    forks.textContent = '🍴 ' + repo.forks_count.toLocaleString();

    const issues = document.createElement('span');
    issues.textContent = '❗ ' + repo.open_issues_count.toLocaleString();

    datos.append(spanLenguaje, estrellas, forks, issues);
    resultado.append(titulo, descripcion, datos);

    // El botón ahora sirve para pedir otro repositorio
    botonAccion.textContent = 'Actualizar';
    botonAccion.classList.remove('rojo', 'oculto');
}

//Llamada a la API de GitHub

// Pide una página de resultados (100 repositorios por página)
async function pedirPagina(lenguaje, pagina) {
    const consulta = encodeURIComponent('language:' + lenguaje);
    const url = `https://api.github.com/search/repositories?q=${consulta}&sort=stars&per_page=100&page=${pagina}`;

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error('Error en la respuesta de la API');
    }
    return respuesta.json();
}

async function buscarRepositorio() {
    const lenguaje = selector.value;

    // Si no hay lenguaje elegido, mostramos el estado vacío
    if (lenguaje === '') {
        mostrarVacio();
        return;
    }

    mostrarCargando();

    try {
        // La API solo da los primeros 1000 resultados: elegimos una página al azar del 1 al 10
        const paginaAzar = Math.floor(Math.random() * 10) + 1;
        let datos = await pedirPagina(lenguaje, paginaAzar);

        // Si esa página vino vacía, usamos la primera
        if (datos.items.length === 0) {
            datos = await pedirPagina(lenguaje, 1);
        }

        // Elegimos un repositorio al azar de la página
        const posicion = Math.floor(Math.random() * datos.items.length);
        mostrarRepositorio(datos.items[posicion], lenguaje);
    } catch (error) {
        console.error(error);
        mostrarError();
    }
}

//Eventos

// Al cambiar el lenguaje, buscamos un repositorio
selector.addEventListener('change', buscarRepositorio);

// El botón (Actualizar o Reintentar) vuelve a buscar
botonAccion.addEventListener('click', buscarRepositorio);
