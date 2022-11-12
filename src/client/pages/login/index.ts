import state from './store';
import View from './View';
import App from './App';

const node = <HTMLElement>document.getElementById('app');
App(state, View, node);
