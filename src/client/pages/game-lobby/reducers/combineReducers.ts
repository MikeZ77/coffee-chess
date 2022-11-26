import { Reducers } from '../../../common/types';
import { State } from '../state';
import { GameConsoleAction, NavBarAction } from '../actions/index';

export type CombinedActions = NavBarAction & GameConsoleAction;

export const combineReducers = (reducers: Reducers<State, CombinedActions>) => {
  return (action: CombinedActions, state: State): State => {
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
