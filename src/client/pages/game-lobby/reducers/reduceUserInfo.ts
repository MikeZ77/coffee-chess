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
    default: {
      return state;
    }
  }
};

export default reduceUserInfo;
