import { Reducer } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/index';
import type { HttpRequest } from 'common/types';

const { SERVER_FQDN } = process.env;

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
    case 'SPINNER_ONE_MINUTE': {
      const { search } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: {
          ...state.sideNavBar,
          oneMinuteSearching: search
        }
      };
    }
    case 'SPINNER_FIVE_MINUTE': {
      const { search } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: {
          ...state.sideNavBar,
          fiveMinuteSearching: search
        }
      };
    }
    case 'SPINNER_FIFTEEN_MINUTE': {
      const { search } = action;
      return {
        ...state,
        reduced: true,
        sideNavBar: {
          ...state.sideNavBar,
          fifteenMinuteSearching: search
        }
      };
    }
    case 'SEARCH_ONE_MINUTE': {
      const { search } = action;
      const pendingRequest: HttpRequest = {
        endpoint: SERVER_FQDN + '/api/v1/game/search/1+0',
        method: search ? 'POST' : 'DELETE'
      };
      return {
        ...state,
        reduced: true,
        pendingRequest
      };
    }
    case 'SEARCH_FIVE_MINUTE': {
      const { search } = action;
      const pendingRequest: HttpRequest = {
        endpoint: SERVER_FQDN + '/api/v1/game/search/5+0',
        method: search ? 'POST' : 'DELETE'
      };
      return {
        ...state,
        reduced: true,
        pendingRequest
      };
    }
    case 'SEARCH_FIFTEEN_MINUTE': {
      const { search } = action;
      const pendingRequest: HttpRequest = {
        endpoint: SERVER_FQDN + '/api/v1/game/search/15+0',
        method: search ? 'POST' : 'DELETE'
      };
      return {
        ...state,
        reduced: true,
        pendingRequest
      };
    }
    default: {
      return state;
    }
  }
};

// let { oneMinuteSearching } = state.sideNavBar;
// oneMinuteSearching = !oneMinuteSearching;
// const pendingRequest: HttpRequest = {
//   endpoint: SERVER_FQDN + '/api/v1/game/search/1+0',
//   method: oneMinuteSearching ? 'POST' : 'DELETE'
// };

// ...state,
// reduced: true,
// pendingRequest: search ? null : pendingRequest,

export default reduceSideNavBar;
