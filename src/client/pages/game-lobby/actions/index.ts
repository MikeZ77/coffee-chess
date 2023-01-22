import { GameConsoleAction } from './gameConsole';
import { NavBarAction } from './sideNavBar';
import { UserAction } from './userInfo';
import { GameAction } from './gameBoard';

export {
  updateChatMessage,
  clearChatMessage,
  updateChatLog,
  updateDrawOffer,
  setChatTimeout,
  setDisableChat,
  updateConsoleMoveHistory,
  resetGameState
} from './gameConsole';
export { updateUserInfo, disablePage, setDisconnectInterval } from './userInfo';
export {
  initGame,
  setPlayerColor,
  updatePlayerTime,
  updateGameState,
  updateGameResult,
  setBoardPosition,
  setLowTimeSoundPlayed
} from './gameBoard';
export {
  openNewGameMenu,
  spinnerSearchOneMinute,
  spinnerSearchFiveMinute,
  spinnerSearchFifteenMinute,
  requestSearchOneMinute,
  requestSearchMinute,
  requestSearchFifteenMinute,
  setAudioNewGame,
  requestLogout
} from './sideNavBar';

export type AllActions = GameConsoleAction & NavBarAction & UserAction & GameAction;
export type AnyActions = GameConsoleAction | NavBarAction | UserAction | GameAction;
export type SocketActions = UserAction | GameAction | GameConsoleAction;

export type { GameConsoleAction } from './gameConsole';
export type { NavBarAction } from './sideNavBar';
export type { UserAction } from './userInfo';
export type { GameAction } from './gameBoard';
