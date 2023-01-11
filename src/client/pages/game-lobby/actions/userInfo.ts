import type { UserInfo } from '@Types';
export type UserAction =
  | { type: 'UPDATE_USER_INFO'; info: UserInfo }
  | { type: 'DISABLE_PAGE' }
  | { type: 'CLIENT_DISCONNECTED'; disconnected: boolean }
  | { type: 'DISCONNECT_INTERVAL'; interval: number | null };

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

export const setDisconnectInterval = (interval: number | null): UserAction => {
  return {
    type: 'DISCONNECT_INTERVAL',
    interval
  };
};
