import state from './state';
import View from './View';
import App from './App';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/solid';
// import '@fortawesome/fontawesome-free/scss/all.min.css';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { faCommentSlash } from '@fortawesome/free-solid-svg-icons/faCommentSlash';
import '../../public/images/chessboard-sprite.svg';
import '../../public/styles/bulma.styles.scss';
import '../../public/styles/cm-chessboard.scss';
import '../../public/styles/promotion-dialog.scss';
import '../../public/styles/_cm-chessboard-theme.scss';
import 'tippy.js/dist/tippy.css';

// library.add(faCommentSlash);
const node = <HTMLElement>document.getElementById('app');
App(state, View, node);
