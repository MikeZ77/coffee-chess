import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { View, Dispatch } from '../../common/types';
import { State } from './state';
import { AllActions, AnyActions } from './actions/index';
// import { sendRequest, hanldeError } from './request';
import {
  combineReducers,
  reduceGameConsole,
  reduceSideNavBar
} from './reducers/index';
import { initChessboard } from './utils/chessboard';
import {
  initTooltipAttributes,
  initEventListeners
} from './utils/simple.utils';

const app = (
  initState: State,
  view: View<State, AnyActions>,
  node: HTMLElement
) => {
  const dispatch: Dispatch<AnyActions> = (action) => {
    state = reduce(<AllActions>action, state);
    // if (state.pendingRequest != null) {
    //   const newRequest = { ...state.pendingRequest };
    //   state.pendingRequest = null;
    //   sendRequest(newRequest).catch((error) => {
    //     hanldeError(error, dispatch);
    //   });
    // }
    const updatedView = view(dispatch, state);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  };

  let state = initState;
  let currentView = view(dispatch, state);
  let rootNode = createElement(currentView);
  const reduce = combineReducers({ reduceGameConsole, reduceSideNavBar });
  node.appendChild(rootNode);
  initChessboard();
  initEventListeners();
  initTooltipAttributes({
    'player-list': 'Player List',
    'current-game': 'Current Game',
    games: 'Games',
    chat: 'Chat'
  });
};

export default app;
