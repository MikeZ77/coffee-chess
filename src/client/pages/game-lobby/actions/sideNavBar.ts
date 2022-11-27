export type NavBarAction =
  | { type: 'OPEN_NEW_GAME_MENU'; newGameMenuOpen: boolean }
  | { type: 'SEARCH_ONE_MINUTE' }
  | { type: 'SEARCH_THREE_MINUTE' }
  | { type: 'SEARCH_FIFTEEN_MINUTE' };

export const openNewGameMenu = (newGameMenuOpen: boolean): NavBarAction => {
  return {
    type: 'OPEN_NEW_GAME_MENU',
    newGameMenuOpen
  };
};

export const searchOneMinute = (): NavBarAction => {
  return { type: 'SEARCH_ONE_MINUTE' };
};

export const searchThreeMinute = (): NavBarAction => {
  return { type: 'SEARCH_THREE_MINUTE' };
};

export const searchFifteenMinute = (): NavBarAction => {
  return { type: 'SEARCH_FIFTEEN_MINUTE' };
};
