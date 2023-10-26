const API = "https://api.github.com/users/";

const maxTime = 5000;

const app = Vue.createApp({
    data() {
        return {
            search: null,
            result: null,
            error: null,
            message: null,
            favorites: new Map()
        }
    },
    created() {
        // Cargamos los datos de local storage
        const savedFavorites = JSON.parse(localStorage.getItem('favorite'))
        // Gracias al ?. si no existe es propiedad nos dara false sin petar, sino carga los favoritos de localstorage en nuestro mapa
        if (savedFavorites?.length) { // -> https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Optional_chaining
            const favorites = new Map(savedFavorites.map( item => [item.login, item]))
            this.favorites = favorites
        }
    },
    computed:{
        isFavorite() {
            return this.favorites.has(this.result.login)
        },
        allFavorites() {
            return Array.from(this.favorites.values())
        }
    },
    methods: {
        async doSearch() {
            // limpiamos resultados
            this.result = this.error = null;

            // Buscamos la key de favorites (el nombre de usuario)
            const existSavedFavorite = this.favorites.get(this.search)
            // Compromabos si existe convirtiendolo en booleano
            const requestFavorite = (() => {
                if (!!existSavedFavorite) {
                    // Si existe extremos el time y lo restamos para comprobar si ha pasado el tiempo máximo
                    const { time } = existSavedFavorite
                    const now = Date.now()
                    // console.log(`han pasado 5 segunddos? ${now} - ${time} = ${(now - time)} -> ${(now - time) > maxTime}`);
                    // Si ha pasado el tiempo máximo devolvemos true y sigue hacia la petición
                    return (now - time) > maxTime
                }
                // Si no ha pasado el tiempo máximo salimos y no hacemos petición
                return false
            })()


            // Sobre el uso de !!   -> https://chat.openai.com/share/1184a730-8722-404a-86d4-042fe960b8c8
            //                      -> https://g.co/bard/share/20c276fcbb9f
            if (!!existSavedFavorite && !requestFavorite) {
                console.log("Found and we use the cached version")
                return this.result = existSavedFavorite;
            }
            
            try {
                const resp = await fetch(API + this.search);
                if(!resp.ok) throw new Error("Sin resultado")
                const data = await resp.json();
                this.result = data;
                // Como hemos hecho una búsqueda reseteamos el tiempo para la siquiente comparación
                existSavedFavorite.time = Date.now()
            } catch (error) {
                this.error = error;
                this.result = false;
                console.log(error);
            }
        },
        addFavorite() {
            this.result.time = Date.now();
            // Añadimos un elemento al mapa con el nombre de usuario como key
            this.favorites.set(this.result.login, this.result);
            this.setLocalStorage();
        },
        showFavorite(favorite) {
            this.result = favorite
        },
        removeFavorite() {
            this.favorites.delete(this.result.login)
        },
        setLocalStorage() {
            localStorage.setItem('favorite',JSON.stringify(this.allFavorites))
        }
    }
}).mount('#app')