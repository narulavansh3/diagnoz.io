import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Button from './Button';

const AvailabilityToggle = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await api.get('/radiologist/availability');
      setIsAvailable(data.isAvailable);
    };
    
    if (user?.role === 'radiologist') {
      fetchStatus();
    }
  }, [user]);

  const toggleAvailability = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/radiologist/availability', {
        isAvailable: !isAvailable
      });
      setIsAvailable(data.isAvailable);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'radiologist') return null;

  return (
    <Button
      onClick={toggleAvailability}
      isLoading={isLoading}
      className={`${
        isAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
      }`}
    >
      {isAvailable ? 'Available for Cases' : 'Not Available'}
    </Button>
  );
};

export default AvailabilityToggle;