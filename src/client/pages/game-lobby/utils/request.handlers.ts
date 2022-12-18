import { type NavBarAction, searchOneMinute } from '../actions/index';
import { Dispatch } from '@Common/types';
import { errorToast } from '@Common/toast';
import { type AxiosError } from 'axios';

// TODO: Have the server return return a code so that the client can handle the error correctly.
export const hanndleError = (error: AxiosError<string>, dispatch: Dispatch<NavBarAction>) => {
  if (error.response) {
    errorToast(error.response.data);
    dispatch(searchOneMinute(false));
  }
};
