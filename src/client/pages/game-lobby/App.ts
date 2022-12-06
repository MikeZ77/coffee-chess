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
  reduceUserInfo
} from './reducers/index';
import { initChessboard } from './utils/chessboard';
import { initTooltipAttributes, initEventListeners } from './utils/simple.utils';
import registerSocketRooms from './utils/socket.handlers';

const app = (initState: State, view: View<State, AnyActions>, node: HTMLElement) => {
  const dispatch: Dispatch<AnyActions> = (action) => {
    state = reduce(<AllActions>action, state);
    // if (state.pendingRequest != null) {
    //   const newRequest = { ...state.pendingRequest };
    //   state.pendingRequest = null;
    //   sendRequest(newRequest).catch((error) => {
    //     hanldeError(error, dispatch);
    //   });
    // }
    console.log('state', state);
    const updatedView = view(dispatch, state);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  };

  let state = initState;
  let currentView = view(dispatch, state);
  let rootNode = createElement(currentView);
  const reduce = combineReducers({ reduceGameConsole, reduceSideNavBar, reduceUserInfo });
  node.appendChild(rootNode);

  /*  REGISTER SOCKET  */
  const socket = io();
  socket.on('connect', () => {
    socket.removeAllListeners();
    registerSocketRooms(socket, dispatch);
  });
  /*  INITIALIZATION   */
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
