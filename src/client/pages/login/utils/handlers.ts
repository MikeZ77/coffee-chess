import { signInLoading, Action } from '../actions/actions';
import { Dispatch } from '@Common/types';
import { successToast, errorToast } from '@Common/toast';
import { type AxiosError } from 'axios';

const { SERVER_FQDN } = process.env;

export const comingFromRegistration = () => {
  const message = localStorage.getItem('REGISTRATION_COMPLETE');
  if (message) {
    localStorage.removeItem('REGISTRATION_COMPLETE');
    successToast(message);
  }
};

export const handleResponse = () => {
  window.location.assign(`${SERVER_FQDN}`);
};

export const hanldeError = (error: AxiosError<string>, dispatch: Dispatch<Action>) => {
  if (error.response) {
    errorToast(error.response.data);
    dispatch(signInLoading(false));
  }
};
