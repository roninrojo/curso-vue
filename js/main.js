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
        const savedFavorites = JSON.parse(localStorage.getItem('favorite'))
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
            this.result = this.error = null;

            const existSavedFavorite = this.favorites.get(this.search)
            const requestFavorite = (() => {
                if (!!existSavedFavorite) {
                    const { time } = existSavedFavorite
                    const now = Date.now()
                    // console.log(`han pasado 5 segunddos? ${now} - ${time} = ${(now - time)} -> ${(now - time) > maxTime}`);
                    return (now - time) > maxTime
                }
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
            } catch (error) {
                this.error = error;
                this.result = false;
                console.log(error);
            }
        },
        addFavorite() {
            this.result.time = Date.now();
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