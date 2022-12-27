import { GameConsoleAction } from './gameConsole';
import { NavBarAction } from './sideNavBar';
import { UserAction } from './userInfo';
import { GameAction } from './gameBoard';

export { updateChatMessage, sendChatMessage, updateChatLog } from './gameConsole';
export { updateUserInfo } from './userInfo';
export { initNewGame, setPlayerColor, updatePlayerTime, updateGameState } from './gameBoard';
export {
  openNewGameMenu,
  spinnerSearchOneMinute,
  spinnerSearchFiveMinute,
  spinnerSearchFifteenMinute,
  requestSearchOneMinute,
  requestSearchMinute,
  requestSearchFifteenMinute,
  setAudioNewGame
} from './sideNavBar';

export type AllActions = GameConsoleAction & NavBarAction & UserAction & GameAction;
export type AnyActions = GameConsoleAction | NavBarAction | UserAction | GameAction;
export type SocketActions = UserAction | GameAction | GameConsoleAction;

export type { GameConsoleAction } from './gameConsole';
export type { NavBarAction } from './sideNavBar';
export type { UserAction } from './userInfo';
export type { GameAction } from './gameBoard';
