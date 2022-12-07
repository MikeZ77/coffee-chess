import type { Game, GameState, TimeControl } from '@Types';

export interface State {
  userId: string;
  username: string;
  reduced: boolean;
  sideNavBar: SideNavBar;
  gameConsole: GameConsole;
  currentGame: ClientGame;
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

type Modify<T, R> = Omit<T, keyof R> & R;
export type ClientGame = Modify<
  Game,
  {
    type: GameState | null;
    state: TimeControl | null;
    ratingWhite: number | null;
    ratingBlack: number | null;
  }
>;

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
  },
  currentGame: {
    gameId: '',
    userWhite: '',
    ratingWhite: null,
    userBlack: '',
    ratingBlack: null,
    watching: [],
    type: null,
    whiteTime: '',
    blackTime: '',
    state: null,
    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
    gameChat: [{ username: '', message: '' }],
    result: null,
    startTime: null
  }
};

export default state;

// gameId: string;
// userWhite: string;
// userWhiteId?: string;
// userBlack: string;
// userBlackId: string;
// watching: string[];
// type: TimeControl;
// whiteTime: string;
// blackTime: string;
// state: GameState;
// position: string;
// gameChat: GameChat[];
// result: GameResult;
// startTime: string | null;
