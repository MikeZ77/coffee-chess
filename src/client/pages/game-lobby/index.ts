import state from './state';
import View from './View';
import App from './App';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '../../../client/images/chessboard-sprite.svg';
import '../../common/bulma.styles.scss';
import '../../common/cm-chessboard.scss';
import '../../common/_cm-chessboard-theme.scss';
// import '../../../../node_modules/bulma-tooltip/src/sass/index.sass';

const node = <HTMLElement>document.getElementById('app');
App(state, View, node);
