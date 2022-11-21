import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { View, Dispatch } from '../../common/types';
import { State } from './state';
import { NavBarAction } from './actions/sideNavBarActions';
// import { sendRequest, hanldeError } from './request';
import { reduceSideNavBar } from './reducers/reduceSideNavBar';
import { initChessboard } from './utils/chessboard';
import combineReducers from './reducers/combineReducers';
import { initTooltipAttributes } from './utils/simple.utils';

const app = (
  initState: State,
  view: View<State, NavBarAction>,
  node: HTMLElement
) => {
  const dispatch: Dispatch<NavBarAction> = (action) => {
    state = reduce(action, state);

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
  const reduce = combineReducers({ reduceSideNavBar });
  node.appendChild(rootNode);
  initChessboard();
  initTooltipAttributes({
    'player-list': 'Player List',
    'current-game': 'Current Game',
    games: 'Games',
    chat: 'Chat'
  });
};

export default app;
