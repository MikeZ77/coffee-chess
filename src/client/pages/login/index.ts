import state from './state';
import View from './View';
import App from './App';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/brands';

const node = <HTMLElement>document.getElementById('app');
App(state, View, node);
