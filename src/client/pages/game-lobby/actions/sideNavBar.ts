export type NavBarAction =
  | { type: 'OPEN_NEW_GAME_MENU'; newGameMenuOpen: boolean }
  | { type: 'SEARCH_ONE_MINUTE'; search?: boolean }
  | { type: 'SEARCH_THREE_MINUTE'; search?: boolean }
  | { type: 'SEARCH_FIFTEEN_MINUTE'; search?: boolean };

export const openNewGameMenu = (newGameMenuOpen: boolean): NavBarAction => {
  return {
    type: 'OPEN_NEW_GAME_MENU',
    newGameMenuOpen
  };
};

export const searchOneMinute = (search?: boolean): NavBarAction => {
  return { type: 'SEARCH_ONE_MINUTE', search };
};

export const searchThreeMinute = (search?: boolean): NavBarAction => {
  return { type: 'SEARCH_THREE_MINUTE', search };
};

export const searchFifteenMinute = (search?: boolean): NavBarAction => {
  return { type: 'SEARCH_FIFTEEN_MINUTE', search };
};
