import { ActionType, Action } from './types';

export const updateInputUsername = (username: string): Action => {
  return {
    type: ActionType.UPDATE_USERNAME,
    payload: username
  };
};

export const updateInputPassword = (password: string): Action => {
  return {
    type: ActionType.UPDATE_PASSWORD,
    payload: password
  };
};
