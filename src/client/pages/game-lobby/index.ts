import state from './state';
import View from './View';
import App from './App';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@Public/images/fontawsome-regular';
import '@Public/images/fontawsome-solid';
import '@Public/images/chessboard-sprite.svg';
import '@Public/styles/bulma.styles.scss';
import '@Public/styles/cm-chessboard.scss';
import '@Public/styles/promotion-dialog.scss';
import '@Public/styles/_cm-chessboard-theme.scss';
import 'tippy.js/dist/tippy.css';

const node = <HTMLElement>document.getElementById('app');
App(state, View, node);
