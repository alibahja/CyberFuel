import CustomAlert, { CustomAlertButton } from '@/components/CustomAlert';
import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';

export function useCustomAlert() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    buttons?: CustomAlertButton[];
  }>({
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK', style: 'default' }],
  });

  const {themeMode} =useSettings();

  const showAlert = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info', 
    buttons?: CustomAlertButton[]
  ) => {
    setConfig({ 
      title, 
      message, 
      type, 
      buttons: buttons || [{ text: 'OK', style: 'default' }]
    });
    setVisible(true);
  };

  const hideAlert = () => setVisible(false);

  const AlertComponent = () => (
    <CustomAlert
      visible={visible}
      title={config.title}
      message={config.message}
      type={config.type}
      buttons={config.buttons}
      onClose={hideAlert}
      themeMode={themeMode}
    />
  );

  return { showAlert, hideAlert, AlertComponent };
}