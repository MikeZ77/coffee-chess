import models from './state';
import View from './View';
import App from './App';

const node = <HTMLElement>document.getElementById('app');
console.log('Hello');
App(models, View, node);
