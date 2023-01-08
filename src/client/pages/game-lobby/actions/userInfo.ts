import type { UserInfo } from '@Types';
export type UserAction =
  | { type: 'UPDATE_USER_INFO'; info: UserInfo }
  | { type: 'DISABLE_PAGE' };

export const updateUserInfo = (info: UserInfo): UserAction => {
  return {
    type: 'UPDATE_USER_INFO',
    info
  };
};

export const disablePage = (): UserAction => {
  return {
    type: 'DISABLE_PAGE'
  };
};
