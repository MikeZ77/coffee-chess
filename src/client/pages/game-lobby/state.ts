import type { Game, GameState, TimeControl, GamePayloads } from '@Types';
import { HttpRequest } from 'common/types';

export interface State {
  userId: string;
  username: string;
  reduced: boolean;
  pendingRequest: HttpRequest<GamePayloads> | null;
  sideNavBar: SideNavBar;
  gameConsole: GameConsole;
  currentGame: ClientGame;
  audio: Audio;
}

type SideNavBar = {
  newGameMenuOpen: boolean;
  oneMinuteSearching: boolean;
  fiveMinuteSearching: boolean;
  fifteenMinuteSearching: boolean;
};

type GameConsole = {
  gameChatMessage: string;
  timeout: boolean;
  disableChat: boolean;
};

export type Color = 'w' | 'b' | null;
type Modify<T, R> = Omit<T, keyof R> & R;
export type ClientGame = Modify<
  Game,
  {
    type: TimeControl | null;
    state: GameState | null;
    ratingWhite: number | null;
    ratingBlack: number | null;
    whiteTime: number | null;
    blackTime: number | null;
    color: Color;
  }
>;

type Audio = {
  newGameSound: HTMLAudioElement | null;
  pieceMoveSound: HTMLAudioElement | null;
  lowTimeSound: HTMLAudioElement | null;
  notificationSound: HTMLAudioElement | null;
};

const state: State = {
  userId: '',
  username: '',
  reduced: false,
  pendingRequest: null,
  sideNavBar: {
    newGameMenuOpen: false,
    oneMinuteSearching: false,
    fiveMinuteSearching: false,
    fifteenMinuteSearching: false
  },
  gameConsole: {
    gameChatMessage: '',
    timeout: false,
    disableChat: false
  },
  currentGame: {
    gameId: '',
    userWhite: '',
    ratingWhite: null,
    userBlack: '',
    ratingBlack: null,
    watching: [],
    type: null,
    whiteTime: null,
    blackTime: null,
    state: null,
    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
    pendingDrawOfferFrom: null,
    history: [],
    gameChat: [{ username: '', message: '' }],
    result: null,
    startTime: null,
    color: null
  },
  audio: {
    newGameSound: null,
    pieceMoveSound: null,
    lowTimeSound: null,
    notificationSound: null
  }
};

export default state;
