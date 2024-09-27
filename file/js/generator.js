function newurl(imb) {
    return fetch('https://tv-vivo.github.io/live/api/premium.js')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const movie = data.find(movie => movie.imb === imb);
            return movie ? movie.url : 'Película no encontrada';
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            return 'Error al obtener la película';
        });
}

async function generar() {
    let serieKey = document.getElementById('numero').value;
    let languaje = "es-MX";
    let seasonNumber = document.getElementById('numeroTemporada').value;

    const cargarPeliculas = async () => {
        if (isSerie.checked) {
            // Código para series...
        } else if (isMovie.checked) {
            try {
                const respuesta = await fetch(`https://api.themoviedb.org/3/movie/${serieKey}?api_key=c71d55c790adcb0fa9ea6ebcbc9a61a7&language=${languaje}`);
                
                if (respuesta.status === 200) {
                    const datos = await respuesta.json();
                    console.log(datos);

                    let tags = datos.genres.map(genre => genre.name).join(', ');

                    // Obtiene la URL de la película
                    vpnmax = await newurl(serieKey); // Almacena la URL en la variable vpnmax

                    let template = document.getElementById('html-final');
                    let justHtml = `[stt/Pelicula]
[hd/HD]
[sc/${datos.vote_average.toFixed(1)}]

<!-- 
TITULO DE LA ENTRADA:    ${datos.title} - ${datos.release_date.slice(0,4)}
GENEROS/ETIQUETAS:    ${tags}, Peliculas
IMAGEN DE FONDO:     https://image.tmdb.org/t/p/original${datos.backdrop_path}
-->

<span><!--more--></span>
<img src="https://image.tmdb.org/t/p/w300/${datos.poster_path}" style="display: none;" />
<p>

[ss]
[Trailer;*]
[/ss]

[nd]
${datos.overview}
[/nd]

<id>

[br/REPRODUCTOR]

[Opcion 1|${vpnmax}] <!-- Utiliza vpnmax aquí -->

<!--Todos los derechos reservados @ANDRES-VPN-->
`;

                    template.innerText = justHtml;

                    const btnCopiar = document.getElementById('copiar');
                    btnCopiar.addEventListener('click', () => {
                        navigator.clipboard.writeText(justHtml); // Copia el contenido correcto
                    });

                    let genPoster = document.getElementById('info-poster');
                    let genTitle = document.getElementById('info-title');
                    let genYear = document.getElementById('info-year');

                    genPoster.setAttribute('src', `https://image.tmdb.org/t/p/w300/${datos.poster_path}`);
                    genTitle.innerText = datos.title;
                    genYear.innerText = datos.release_date.slice(0, 4);
                } else if (respuesta.status === 401) {
                    console.log('Wrong key');
                } else if (respuesta.status === 404) {
                    console.log('No existe');
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    cargarPeliculas();
}

generar();
