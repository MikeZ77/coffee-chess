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
  username: string;
  password: string;
  loading: boolean;
  pendingRequest: HttpRequest<Payloads> | null;
};

export type Action =
  | {
      type: 'UPDATE_USERNAME';
      username: string;
    }
  | {
      type: 'UPDATE_PASSWORD';
      password: string;
    }
  | {
      type: 'LOADING_BUTTON';
      loading: boolean;
    }
  | {
      type: 'REQUEST_LOGIN';
      payload: LoginPayload;
    }
  | {
      type: 'REQUEST_REGISTER';
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

export type LoginPayload =
  | {
      username: string;
      password: string;
    }
  | string;

export type Toast = {
  isError: boolean;
  message: string;
};

export type Payloads = LoginPayload | undefined;
