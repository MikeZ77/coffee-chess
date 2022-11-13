import { VNode } from 'virtual-dom';
import { HyperScriptHelperFn } from 'hyperscript-helpers';

export type View = (dispatch: Dispatch, state: State) => VNode;
export type Reducer = (action: Action, state: State) => State;
export type Dispatch = (action: Action) => void;
export type SimpleComponent = (state: State) => HyperScriptHelperFn;
export type Component = (
  dispatch: Dispatch,
  state: State
) => HyperScriptHelperFn;

export type State = {
  placeHolder: null;
};

export type Action = {
  type: 'PLACE_HOLDER';
};

export type Reducers = {
  [index: string]: Reducer;
};

export type HttpRequest<T = void> = {
  endpoint: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  redirect?: 'follow';
  payload?: T;
};

export type Toast = {
  isError: boolean;
  message: string;
};

export type Payloads = void;
