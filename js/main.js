const API = "https://api.github.com/users/";

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
    computed:{
        isFavorite() {
            return this.favorites.has(this.result.id)
        }
    },
    methods: {
        async doSearch() {
            this.result = this.error = null;
            try {
                const resp = await fetch(API + this.search);
                if(!resp.ok) throw new Error("Sin resultado")
                const data = await resp.json();
                console.log(data);
                
                this.result = data;
            } catch (error) {
                this.error = error;
                this.result = false;
                console.log(error);
            }
        },
        addFavorite() {
            this.favorites.set(this.result.id, this.result)
        },
        removeFavorite() {
            this.favorites.delete(this.result.id)
        }
    }
}).mount('#app')