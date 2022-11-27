export interface State {
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
