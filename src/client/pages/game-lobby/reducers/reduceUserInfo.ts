import { Reducer } from 'common/types';
import { State } from '../state';
import { UserAction } from '../actions/index';

const reduceUserInfo: Reducer<State, UserAction> = (action, state): State => {
  switch (action.type) {
    case 'UPDATE_USER_INFO': {
      const { userId, username } = action.info;
      return {
        ...state,
        reduced: true,
        userId,
        username
      };
    }
    case 'DISABLE_PAGE': {
      return {
        ...state,
        reduced: true,
        disablePage: true
      };
    }
    case 'CLIENT_DISCONNECTED': {
      const { disconnected } = action;
      return {
        ...state,
        reduced: true,
        disconnected
      };
    }
    case 'DISCONNECT_INTERVAL': {
      const { interval: disconnectInterval } = action;
      return {
        ...state,
        reduced: true,
        disconnectInterval
      };
    }
    default: {
      return state;
    }
  }
};

export default reduceUserInfo;
