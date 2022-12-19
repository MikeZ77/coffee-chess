import { VNode } from 'virtual-dom';
import { HyperScriptHelperFn } from 'hyperscript-helpers';

export type View<S, A> = (dispatch: Dispatch<A>, state: S) => VNode;
export type Reducer<S, A> = (action: A, state: S) => S;
export type Dispatch<A, S = void> = (action?: A) => S | void;
export type SimpleComponent<S> = (state: S) => HyperScriptHelperFn;
export type Component<S, A> = (dispatch: Dispatch<A>, state: S) => HyperScriptHelperFn;

export type CombineReducers<S, A> = (reducers: Reducers<S, A>) => Reduce<S, A>;
export type Reduce<S, A> = (action: A, state: S) => S;
export type Reducers<S, A> = {
  [index: string]: Reducer<S, A>;
};

// For different optrions extend HttpRequest
export type HttpRequest<T = void> = {
  endpoint: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  redirect?: 'follow';
  payload?: T;
};

export type Payloads = LoginPayload | RegisterPayload | void;

export type LoginPayload = {
  username: string;
  password: string;
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
