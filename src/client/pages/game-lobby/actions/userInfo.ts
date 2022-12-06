import type { UserInfo } from '@Types';
export type UserAction = { type: 'UPDATE_USER_INFO'; info: UserInfo };

export const updateUserInfo = (info: UserInfo): UserAction => {
  return {
    type: 'UPDATE_USER_INFO',
    info
  };
};
