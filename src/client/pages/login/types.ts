import { VNode } from 'virtual-dom';
import { HyperScriptHelperFn } from 'hyperscript-helpers';

export type View = (dispatch: Dispatch, model: Store) => VNode;
export type Reducer = (action: Action, model: Store) => Store;
export type Dispatch = (action: Action, reduce: Reducer) => void;

export type Component<T> = (
  dispatch: Dispatch,
  model: T
) => HyperScriptHelperFn;

export enum ActionType {
  SUBMIT_FORM,
  UPDATE_USERNAME,
  UPDATE_PASSWORD
}

export interface Action {
  type: ActionType;
  payload: string;
}

export type Model = Login | Submit;

export type Login = {
  username: string;
  password: string;
};

export type Submit = {
  submit: boolean;
};

export type Store = { loginModel: Login };
