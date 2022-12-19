import { errorToast } from '@Common/toast';
import { type NavBarAction } from '../actions/index';
import { ClientErrorCodes } from '../../../../types';
import { clearQueueSpinners } from './simple.utils';
import type { Dispatch } from '@Common/types';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@Types';

export const hanldeError = (
  error: AxiosError<ErrorResponse>,
  dispatch: Dispatch<NavBarAction>
) => {
  const clientCode = <number>error.response?.data.clientCode;
  const errorMessage = <string>error.response?.data.message;
  switch (clientCode) {
    case ClientErrorCodes.QUEUE_SEARCH_ERROR: {
      clearQueueSpinners(dispatch);
      errorToast(errorMessage);
      break;
    }
    default:
      if (typeof error.response?.data === 'string') {
        errorToast(error.response?.data);
      } else {
        errorToast(errorMessage);
      }
  }
};
