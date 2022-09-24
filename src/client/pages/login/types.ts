import { VNode } from 'virtual-dom';
import { HyperScriptHelperFn } from 'hyperscript-helpers';

export type View = (dispatch: Dispatch, state: State) => VNode;
export type Reducer = (action: Action, state: State) => State;
export type Dispatch = (action: Action) => void;
export type Component = (
  dispatch: Dispatch,
  state: State
) => HyperScriptHelperFn;

export type State = {
  username: string;
  password: string;
};

export type Action =
  | {
      type: 'UPDATE_USERNAME';
      username: string;
    }
  | {
      type: 'UPDATE_PASSWORD';
      password: string;
    };

export type Reducers = {
  [index: string]: Reducer;
};
