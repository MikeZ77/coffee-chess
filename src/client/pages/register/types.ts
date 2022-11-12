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
  email: string;
  password: string;
  repeatedPassword: string;
  loading: boolean;
  pendingRequest: HttpRequest<Payloads> | null;
};

export type Action =
  | {
      type: 'UPDATE_USERNAME';
      username: string;
    }
  | {
      type: 'UPDATE_EMAIL';
      email: string;
    }
  | {
      type: 'UPDATE_PASSWORD';
      password: string;
    }
  | {
      type: 'UPDATE_REPEATED_PASSWORD';
      repeatedPassword: string;
    }
  | {
      type: 'LOADING_REGISTER';
      loading: boolean;
    }
  | {
      type: 'REQUEST_REGISTER';
      payload: RegisterPayload;
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

export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
};

export type Toast = {
  isError: boolean;
  message: string;
};

export type Payloads = RegisterPayload | void;
