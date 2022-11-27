import { Reducers } from '../../../common/types';
import { State } from '../state';
import { AllActions } from '../actions/index';

export const combineReducers = (reducers: Reducers<State, AllActions>) => {
  return (action: AllActions, state: State): State => {
    let newState = { ...state };
    for (const reducer in reducers) {
      newState = Object.assign(reducers[reducer](action, state));
      if (newState.reduced) {
        return { ...newState, reduced: false };
      }
    }
    return newState;
  };
};
