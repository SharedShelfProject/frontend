import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router/router';
import './styles/main.css';

const app = createApp(App);

app.use(router).mount('#app');
