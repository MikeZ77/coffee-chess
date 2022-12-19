export type NavBarAction =
  | { type: 'OPEN_NEW_GAME_MENU'; newGameMenuOpen: boolean }
  | { type: 'SPINNER_ONE_MINUTE'; search: boolean }
  | { type: 'SPINNER_FIVE_MINUTE'; search: boolean }
  | { type: 'SPINNER_FIFTEEN_MINUTE'; search: boolean }
  | { type: 'SEARCH_ONE_MINUTE'; search: boolean }
  | { type: 'SEARCH_FIVE_MINUTE'; search: boolean }
  | { type: 'SEARCH_FIFTEEN_MINUTE'; search: boolean };

export const openNewGameMenu = (newGameMenuOpen: boolean): NavBarAction => {
  return {
    type: 'OPEN_NEW_GAME_MENU',
    newGameMenuOpen
  };
};

export const spinnerSearchOneMinute = (search: boolean): NavBarAction => {
  return { type: 'SPINNER_ONE_MINUTE', search };
};

export const spinnerSearchFiveMinute = (search: boolean): NavBarAction => {
  return { type: 'SPINNER_FIVE_MINUTE', search };
};

export const spinnerSearchFifteenMinute = (search: boolean): NavBarAction => {
  return { type: 'SPINNER_FIFTEEN_MINUTE', search };
};

export const requestSearchOneMinute = (search: boolean): NavBarAction => {
  return { type: 'SEARCH_ONE_MINUTE', search };
};

export const requestSearchMinute = (search: boolean): NavBarAction => {
  return { type: 'SEARCH_FIVE_MINUTE', search };
};

export const requestSearchFifteenMinute = (search: boolean): NavBarAction => {
  return { type: 'SEARCH_FIFTEEN_MINUTE', search };
};
