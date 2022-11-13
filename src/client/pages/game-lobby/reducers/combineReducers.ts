import { State, Action, Reducers } from '../types';

const combineReducers = (reducers: Reducers) => {
  return (action: Action, state: State): State => {
    let newState = { ...state };
    for (const reducer in reducers) {
      newState = Object.assign(reducers[reducer](action, state));
    }
    return newState;
  };
};

export default combineReducers;
