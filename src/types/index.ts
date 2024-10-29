export interface User {
  id: string;
  email: string;
  role: 'center' | 'radiologist';
  name: string;
  licenseNumber?: string;
  address?: string;
}

export interface Case {
  id: string;
  patientId: string;
  description: string;
  status: 'pending' | 'assigned' | 'completed';
  radiologistId?: string;
  centerId: string;
  createdAt: string;
  updatedAt: string;
}