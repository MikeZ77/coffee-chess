export interface State {
  reduced: boolean;
  sideNavBar: SideNavBar;
  gameConsole: GameConsole;
}

type SideNavBar = {
  newGameDropdownOpen: boolean;
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
    newGameDropdownOpen: false,
    oneMinuteSearching: false,
    threeMinuteSearching: false,
    fifteenMinuteSearching: false
  },
  gameConsole: {
    gameChatMessage: ''
  }
};

export default state;
