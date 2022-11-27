import { GameConsoleAction } from './gameConsole';
import { NavBarAction } from './sideNavBar';

export { updateChatMessage, sendChatMessage } from './gameConsole';
export {
  openNewGameMenu,
  searchOneMinute,
  searchThreeMinute,
  searchFifteenMinute
} from './sideNavBar';

export type AllActions = GameConsoleAction & NavBarAction;
export type AnyActions = GameConsoleAction | NavBarAction;

export type { GameConsoleAction } from './gameConsole';
export type { NavBarAction } from './sideNavBar';
