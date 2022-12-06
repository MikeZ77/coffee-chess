export interface State {
  userId: string;
  username: string;
  reduced: boolean;
  sideNavBar: SideNavBar;
  gameConsole: GameConsole;
}

type SideNavBar = {
  newGameMenuOpen: boolean;
  oneMinuteSearching: boolean;
  threeMinuteSearching: boolean;
  fifteenMinuteSearching: boolean;
};

type GameConsole = {
  gameChatMessage: string;
};

const state: State = {
  userId: '',
  username: '',
  reduced: false,
  sideNavBar: {
    newGameMenuOpen: false,
    oneMinuteSearching: false,
    threeMinuteSearching: false,
    fifteenMinuteSearching: false
  },
  gameConsole: {
    gameChatMessage: ''
  }
};

export default state;
