const API = "https://api.github.com/users/";

const app = Vue.createApp({
    data() {
        return {
            search: null,
            result: null
        }
    },
    methods: {
        async doSearch() {
            try {
                const resp = await fetch(API + this.search);
                const data = await resp.json()
                console.log(data);
                this.result = true;
            } catch (error) {
                console.log(error);
                this.result = false;
            }
        }
    }
}).mount('#app')