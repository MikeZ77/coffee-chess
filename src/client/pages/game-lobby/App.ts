import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import type { View, Dispatch } from '@Common/types';
import type { GamePayloads } from '@Types';
import { type AllActions, type AnyActions, setDisconnectInterval } from './actions/index';
import { State } from './state';
import sendRequest from '@Common/request';
import { successToast } from '@Common/toast';
import { io } from 'socket.io-client';
import { hanldeError } from './utils/request.handlers';
import { boardConfig } from './utils/chess';
import {
  initTooltipAttributes,
  initEventListeners,
  clientDisconnectNotification
} from './utils/simple.utils';
import { registerGameEvents, registerUserEvents } from './utils/socket.handlers';
import { Chessboard } from 'cm-chessboard/src/cm-chessboard/Chessboard';
import {
  combineReducers,
  reduceGameConsole,
  reduceSideNavBar,
  reduceUserInfo,
  reduceGameBoard
} from './reducers/index';

const app = (initState: State, view: View<State, AnyActions>, node: HTMLElement) => {
  const dispatch: Dispatch<AnyActions, State> = (action = undefined) => {
    if (action === undefined) {
      return state;
    }

    state = reduce(<AllActions>action, state);

    if (state.pendingRequest != null) {
      const newRequest = { ...state.pendingRequest };
      const callbackRequest = state.callbackRequest?.bind(state);
      state.pendingRequest = null;
      state.callbackRequest = null;
      sendRequest<GamePayloads>(newRequest)
        .then(() => callbackRequest && callbackRequest())
        .catch((error) => {
          hanldeError(error, dispatch);
        });
    }

    const updatedView = view(dispatch, state);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  };

  let state = initState;
  let currentView = view(dispatch, state);
  let rootNode = createElement(currentView);
  const reduce = combineReducers({
    reduceGameConsole,
    reduceSideNavBar,
    reduceUserInfo,
    reduceGameBoard
  });
  node.appendChild(rootNode);

  /*  INITIALIZATION   */
  const board = new Chessboard(document.getElementById('board'), boardConfig);
  initEventListeners();
  initTooltipAttributes({
    '#player-list': 'Player List',
    '#current-game': 'Current Game',
    '#games': 'Games',
    '#chat': 'Chat'
  });
  /*  REGISTER SOCKET  */
  const socket = io();
  socket.on('connect', () => {
    socket.removeAllListeners();
    registerUserEvents(socket, dispatch);
    registerGameEvents(socket, dispatch, board);
    const { disconnectInterval } = <State>dispatch();
    if (disconnectInterval) {
      window.clearInterval(<number>disconnectInterval);
      dispatch(setDisconnectInterval(null));
      successToast('Connected');
    }
  });

  socket.on('disconnect', () => {
    clientDisconnectNotification(dispatch);
  });
};

export default app;
