import { GameConsoleAction } from './gameConsole';
import { NavBarAction } from './sideNavBar';
import { UserAction } from './userInfo';
import { GameAction } from './gameBoard';

export { updateChatMessage, sendChatMessage, updateChatLog } from './gameConsole';
export { updateUserInfo } from './userInfo';
export { initNewGame, setPlayerColor } from './gameBoard';
export {
  openNewGameMenu,
  searchOneMinute,
  searchThreeMinute,
  searchFifteenMinute
} from './sideNavBar';

export type AllActions = GameConsoleAction & NavBarAction & UserAction & GameAction;
export type AnyActions = GameConsoleAction | NavBarAction | UserAction | GameAction;
export type SocketActions = UserAction | GameAction | GameConsoleAction;

export type { GameConsoleAction } from './gameConsole';
export type { NavBarAction } from './sideNavBar';
export type { UserAction } from './userInfo';
export type { GameAction } from './gameBoard';
