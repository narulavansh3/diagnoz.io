import React from 'react';
import { Bell } from 'lucide-react';
import { api } from '../services/api';

interface Case {
  id: string;
  patientName: string;
  modality: string;
  priority: string;
  clinicalHistory: string;
}

const CaseNotification = () => {
  const [notifications, setNotifications] = React.useState<Case[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Setup WebSocket connection for real-time notifications
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const newCase = JSON.parse(event.data);
      setNotifications(prev => [...prev, newCase]);
    };

    return () => ws.close();
  }, []);

  const acceptCase = async (caseId: string) => {
    try {
      await api.post(`/cases/${caseId}/accept`);
      setNotifications(prev => prev.filter(n => n.id !== caseId));
    } catch (error) {
      console.error('Failed to accept case:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">New Cases</h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-b pb-4">
                  <p className="font-medium">{notification.patientName}</p>
                  <p className="text-sm text-gray-600">{notification.modality}</p>
                  <p className="text-sm text-gray-600 mb-2">{notification.clinicalHistory}</p>
                  <button
                    onClick={() => acceptCase(notification.id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Accept Case
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseNotification;