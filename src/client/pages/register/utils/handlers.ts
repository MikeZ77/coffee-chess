import { Dispatch } from '@Common/types';
import type { AxiosResponse, AxiosError } from 'axios';
import { registerLoading, Action } from '../actions/actions';
import { errorToast } from '@Common/toast';

const { SERVER_FQDN } = process.env;

export const handleResponse = (response: AxiosResponse) => {
  localStorage.setItem('REGISTRATION_COMPLETE', response.data.message);
  window.location.assign(`${SERVER_FQDN}/login`);
};

export const hanldeError = (error: AxiosError<string>, dispatch: Dispatch<Action>) => {
  dispatch(registerLoading(false));
  if (error.response) {
    errorToast(error.response.data);
  }
};
