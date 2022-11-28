import { toast } from 'bulma-toast';

export const errorToast = (message: string): void => {
  toast({
    message: message,
    type: 'is-danger',
    position: 'bottom-center',
    dismissible: true,
    pauseOnHover: true,
    duration: 4500
  });
};

export const successToast = (message: string): void => {
  toast({
    message: message,
    type: 'is-success',
    position: 'bottom-center',
    dismissible: true,
    pauseOnHover: true,
    duration: 4500
  });
};
