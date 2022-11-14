import { State } from '../state';
import { Action } from '../actions/actions';
import { CombineReducers } from 'common/types';

const combineReducers: CombineReducers<State, Action> = (reducers) => {
  return (action, state) => {
    let newState = { ...state };
    for (const reducer in reducers) {
      newState = Object.assign(reducers[reducer](action, state));
    }
    return newState;
  };
};

export default combineReducers;
