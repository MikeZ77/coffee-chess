import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { View, Dispatch } from '@Common/types';
import { State } from './state';
import { AllActions, AnyActions } from './actions/index';
import sendRequest from '@Common/request';
import { io } from 'socket.io-client';
import {
  combineReducers,
  reduceGameConsole,
  reduceSideNavBar,
  reduceUserInfo,
  reduceGameBoard
} from './reducers/index';
import { boardConfig } from './utils/chessboard';
import { initTooltipAttributes, initEventListeners } from './utils/simple.utils';
import { registerGameEvents, registerUserEvents } from './utils/socket.handlers';
import { Chessboard } from 'cm-chessboard/src/cm-chessboard/Chessboard';

const app = (initState: State, view: View<State, AnyActions>, node: HTMLElement) => {
  const dispatch: Dispatch<AnyActions> = (action = undefined) => {
    if (action === undefined) {
      return state;
    }
    state = reduce(<AllActions>action, state);
    // console.log('state:', state);
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
    'player-list': 'Player List',
    'current-game': 'Current Game',
    games: 'Games',
    chat: 'Chat'
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

// // server-side
// io.use((socket, next) => {
//   const err = new Error("not authorized");
//   err.data = { content: "Please retry later" }; // additional details
//   next(err);
// });

// // client-side
// socket.on("connect_error", (err) => {
//   console.log(err instanceof Error); // true
//   console.log(err.message); // not authorized
//   console.log(err.data); // { content: "Please retry later" }
// });
