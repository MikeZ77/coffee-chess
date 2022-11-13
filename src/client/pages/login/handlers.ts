import { toast } from 'bulma-toast';

export const comingFromRegistration = () => {
  const message = localStorage.getItem('REGISTRATION_COMPLETE');
  if (message) {
    localStorage.removeItem('REGISTRATION_COMPLETE');
    toast({
      message: message,
      type: 'is-success',
      position: 'bottom-center',
      dismissible: true,
      pauseOnHover: true,
      duration: 3000
    });
  }
};
