import { showMessage } from 'react-native-flash-message';

export const useToast = () => {
  const showSuccess = (message: string, description?: string) => {
    showMessage({
      message,
      description,
      type: 'success',
      icon: 'success',
      duration: 3000,
      floating: true,
    });
  };

  const showError = (message: string, description?: string) => {
    showMessage({
      message,
      description,
      type: 'danger',
      icon: 'danger',
      duration: 4000,
      floating: true,
    });
  };

  const showWarning = (message: string, description?: string) => {
    showMessage({
      message,
      description,
      type: 'warning',
      icon: 'warning',
      duration: 3500,
      floating: true,
    });
  };

  const showInfo = (message: string, description?: string) => {
    showMessage({
      message,
      description,
      type: 'info',
      icon: 'info',
      duration: 3000,
      floating: true,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
