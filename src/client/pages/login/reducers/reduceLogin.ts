import { Reducer } from '../types';

export const reduceLogin: Reducer = (action, state) => {
  switch (action.type) {
    case 'UPDATE_USERNAME': {
      const { username } = action;
      return { ...state, username };
    }
    case 'UPDATE_PASSWORD': {
      const { password } = action;
      return { ...state, password };
    }
  }
};
