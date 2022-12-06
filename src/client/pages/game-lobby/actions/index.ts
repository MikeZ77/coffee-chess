import { GameConsoleAction } from './gameConsole';
import { NavBarAction } from './sideNavBar';
import { UserAction } from './userInfo';

export { updateChatMessage, sendChatMessage } from './gameConsole';
export { updateUserInfo } from './userInfo';
export {
  openNewGameMenu,
  searchOneMinute,
  searchThreeMinute,
  searchFifteenMinute
} from './sideNavBar';

export type AllActions = GameConsoleAction & NavBarAction & UserAction;
export type AnyActions = GameConsoleAction | NavBarAction | UserAction;
export type SocketActions = UserAction;

export type { GameConsoleAction } from './gameConsole';
export type { NavBarAction } from './sideNavBar';
export type { UserAction } from './userInfo';
