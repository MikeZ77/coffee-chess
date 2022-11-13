import { Reducer, State } from '../types';

const { SERVER_FQDN } = process.env;

export const reduceSideNavBar: Reducer = (action, state): State => {
  switch (action.type) {
    case 'PLACE_HOLDER': {
      return { ...state };
    }
    default: {
      return state;
    }
  }
};
