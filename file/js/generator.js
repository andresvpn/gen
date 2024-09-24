let isSerie = document.getElementById('serie');
let isMovie = document.getElementById('movie');

let types = document.querySelectorAll('input[type=radio][name=type]');

types.forEach(type => {
    type.addEventListener('change', () =>{
        if (type.value == "movie") {
            document.getElementById('season-selector').style.display = "none";
        } else if (type.value == "serie"){
            document.getElementById('season-selector').style.display = "block";
        }
    });
});

function convertMinutes(minutes) {
    let hours = Math.floor(minutes / 60),
        mins = Math.floor(minutes % 60),
        total = '';

    if (minutes < 60) {
        total = `${mins}m`;
    } else if (minutes >= 60) {
        total = `${hours}h ${mins}m`;
    }
    return total;
}

function generar() {
    let serieKey = document.getElementById('numero').value;
    let languaje = "es-MX";
    let seasonNumber = document.getElementById('numeroTemporada').value;

    const cargarPeliculas = async () => {
        if (isSerie.checked) {
            try {
                const respuesta = await fetch(`https://api.themoviedb.org/3/tv/${serieKey}?api_key=c71d55c790adcb0fa9ea6ebcbc9a61a7&language=${languaje}`);
                const temporadas = await fetch(`https://api.themoviedb.org/3/tv/${serieKey}/season/${seasonNumber}?api_key=c71d55c790adcb0fa9ea6ebcbc9a61a7&language=${languaje}`);

                if (respuesta.status === 200 && temporadas.status === 200) {
                    const datos = await respuesta.json();
                    const temporadaData = await temporadas.json();

                    let tags = datos.genres.map(genre => genre.name).join(', ');

                    let episodes = temporadaData.episodes.map(episode => `[ss] [Episodio ${episode.episode_number} (${episode.name})](${convertMinutes(episode.runtime)} | ${episode.vote_average.toFixed(1)}⭐) [/ss]`).join("\n");

                    let template = document.getElementById('html-final');
                    let justHtml = `
[stt/Serie]
[hd/HD]
[sc/${temporadaData.vote_average.toFixed(1)}]

<!-- 
TITULO DE LA ENTRADA:    ${datos.name} - Temporada ${temporadaData.season_number} (${datos.first_air_date.slice(0, 4)})
GENEROS/ETIQUETAS:    ${tags}, Series
IMAGEN DE FONDO:     https://image.tmdb.org/t/p/original${datos.backdrop_path}
-->

<span><!--more--></span>
<img src="https://image.tmdb.org/t/p/w300/${temporadaData.poster_path}" style="display: none;" />
<p>

${episodes}

[nd]
${datos.overview}
[/nd]

<id>

[br/REPRODUCTOR]

[Opcion 1|]
  
<!--Todos los derechos reservados @ANDRES-VPN-->

`;

                    template.innerText = justHtml;
                    let templateHTML = template.innerText;

                    const btnCopiar = document.getElementById('copiar');
                    btnCopiar.addEventListener('click', () => {
                        navigator.clipboard.writeText(templateHTML);
                    });

                    // Actualización de la UI con la info obtenida
                    let genPoster = document.getElementById('info-poster');
                    let genTitle = document.getElementById('info-title');
                    let genSeasons = document.getElementById('info-seasons');
                    let genYear = document.getElementById('info-year');

                    genPoster.setAttribute('src', `https://image.tmdb.org/t/p/w300/${temporadaData.poster_path}`);
                    genTitle.innerText = `${datos.name} - T${temporadaData.season_number}`;
                    genSeasons.innerText = `T${temporadaData.season_number}`;
                    genYear.innerText = datos.first_air_date.slice(0, 4);
                } else if (respuesta.status === 404) {
                    console.log('Serie no encontrada');
                }

            } catch (error) {
                console.log(error);
            }

        } else if (isMovie.checked) {
            try {
                const respuesta = await fetch(`https://api.themoviedb.org/3/movie/${serieKey}?api_key=c71d55c790adcb0fa9ea6ebcbc9a61a7&language=${languaje}`);

                if (respuesta.status === 200) {
                    const datos = await respuesta.json();

                    let tags = datos.genres.map(genre => genre.name).join(', ');

                    // Aquí integramos la función para obtener la URL desde tu archivo premium.js
                    const getMovieLink = async (imb) => {
                        const url = 'https://tv-vivo.github.io/live/api/premium.js';
                        const response = await fetch(url);
                        const data = await response.text();
                        // Ejecutar el JS y obtener la lista de películas
                        eval(data); // Esto asigna el contenido del archivo premium.js
                        const movie = premium.find(m => m.imb === imb);
                        return movie ? movie.url : "Película no encontrada";
                    };

                    getMovieLink(serieKey).then(url => {
                        let template = document.getElementById('html-final');
                        let justHtml = `
[stt/Pelicula]
[hd/HD]
[sc/${datos.vote_average.toFixed(1)}]

<!-- 
TITULO DE LA ENTRADA:    ${datos.title} - ${datos.release_date.slice(0, 4)}
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

[Opcion 1|${url}]
  
<!--Todos los derechos reservados @ANDRES-VPN-->

`;

                        template.innerText = justHtml;
                        let templateHTML = template.innerText;

                        const btnCopiar = document.getElementById('copiar');
                        btnCopiar.addEventListener('click', () => {
                            navigator.clipboard.writeText(templateHTML);
                        });

                        // Actualización de la UI con la info obtenida
                        let genPoster = document.getElementById('info-poster');
                        let genTitle = document.getElementById('info-title');
                        let genSeasons = document.getElementById('info-seasons');
                        let genYear = document.getElementById('info-year');

                        genPoster.setAttribute('src', `https://image.tmdb.org/t/p/w300/${datos.poster_path}`);
                        genTitle.innerText = datos.title;
                        genSeasons.innerText = "";
                        genYear.innerText = datos.release_date.slice(0, 4);
                    });

                } else if (respuesta.status === 401) {
                    console.log('Wrong key');
                } else if (respuesta.status === 404) {
                    console.log('No existe');
                }

            } catch (error) {
                console.log(error);
            }
        }
    };

    cargarPeliculas();
}

generar();
