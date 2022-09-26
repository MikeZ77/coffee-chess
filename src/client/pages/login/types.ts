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
  noitificationShow: boolean;
  notificationLevel: 'is-danger' | 'is-success' | 'is-warning' | '';
  noitificationMessage: string;
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
      body: LoginPayload;
    };

export type Reducers = {
  [index: string]: Reducer;
};

export type HttpRequest<T> = {
  endpoint: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  headers: Headers;
  redirect?: 'follow';
  credentials?: 'same-origin';
  body?: T;
};

export type LoginPayload =
  | {
      username: string;
      password: string;
    }
  | string;

export type Payloads = LoginPayload | undefined;

export enum RequestCode {
  LOGIN = 1000
}
