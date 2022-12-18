import { Reducer } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/index';
// const { SERVER_FQDN } = process.env;

const reduceSideNavBar: Reducer<State, NavBarAction> = (action, state): State => {
  switch (action.type) {
    case 'OPEN_NEW_GAME_MENU': {
      const { newGameMenuOpen } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: { ...state.sideNavBar, newGameMenuOpen: !newGameMenuOpen }
      };
    }
    case 'SEARCH_ONE_MINUTE': {
      const { oneMinuteSearching } = state.sideNavBar;
      const { search } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: {
          ...state.sideNavBar,
          oneMinuteSearching: search ? search : !oneMinuteSearching
        }
      };
    }
    case 'SEARCH_THREE_MINUTE': {
      const { threeMinuteSearching } = state.sideNavBar;
      const { search } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: {
          ...state.sideNavBar,
          threeMinuteSearching: search ? search : !threeMinuteSearching
        }
      };
    }
    case 'SEARCH_FIFTEEN_MINUTE': {
      const { fifteenMinuteSearching } = state.sideNavBar;
      const { search } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: {
          ...state.sideNavBar,
          fifteenMinuteSearching: search ? search : !fifteenMinuteSearching
        }
      };
    }

    default: {
      return state;
    }
  }
};

export default reduceSideNavBar;
