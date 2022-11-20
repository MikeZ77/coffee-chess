import { Reducer, HttpRequest } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBarActions';
const { SERVER_FQDN } = process.env;

export const reduceSideNavBar: Reducer<State, NavBarAction> = (
  action,
  state
): State => {
  switch (action.type) {
    case 'TEST_ACTION': {
      return { ...state };
    }
    default: {
      return state;
    }
  }
};
