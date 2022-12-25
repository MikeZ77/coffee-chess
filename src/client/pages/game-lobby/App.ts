import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import type { View, Dispatch } from '@Common/types';
import type { GamePayloads } from '@Types';
import { State } from './state';
import { AllActions, AnyActions } from './actions/index';
import sendRequest from '@Common/request';
import { io } from 'socket.io-client';
import { hanldeError } from './utils/request.handlers';
import { boardConfig } from './utils/chess';
import { initTooltipAttributes, initEventListeners } from './utils/simple.utils';
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
  const dispatch: Dispatch<AnyActions> = (action = undefined) => {
    if (action === undefined) {
      return state;
    }

    state = reduce(<AllActions>action, state);

    if (state.pendingRequest != null) {
      const newRequest = { ...state.pendingRequest };
      state.pendingRequest = null;
      sendRequest<GamePayloads>(newRequest).catch((error) => {
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
  });
};

export default app;
