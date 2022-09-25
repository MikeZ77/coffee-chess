import state from './Store';
import View from './View';
import App from './App';

const node = <HTMLElement>document.getElementById('app');
App(state, View, node);
