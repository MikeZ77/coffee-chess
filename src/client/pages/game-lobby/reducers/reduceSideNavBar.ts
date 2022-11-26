import { Reducer } from 'common/types';
import { State } from '../state';
import { NavBarAction, GameConsoleAction } from '../actions/index';
const { SERVER_FQDN } = process.env;

const reduceSideNavBar: Reducer<State, NavBarAction> = (
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

export default reduceSideNavBar;
