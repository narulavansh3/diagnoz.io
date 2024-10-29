import { api } from './api';

export interface Case {
  id: string;
  patientName: string;
  patientAge: number;
  modality: string;
  imageUrl: string;
  clinicalHistory: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assigneeId?: string;
  centerName?: string;
  radiologistName?: string;
  findings?: string;
  impression?: string;
}

export const casesService = {
  async getCases(): Promise<Case[]> {
    try {
      const response = await api.get('/cases');
      return response;
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  },

  async createCase(caseData: Partial<Case>): Promise<Case> {
    try {
      const response = await api.post('/cases', caseData);
      return response;
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  },

  async acceptCase(caseId: string): Promise<Case> {
    try {
      const response = await api.post(`/cases/${caseId}/accept`);
      return response;
    } catch (error) {
      console.error('Error accepting case:', error);
      throw error;
    }
  },

  async submitReport(caseId: string, reportData: { findings: string; impression: string }): Promise<Case> {
    try {
      const response = await api.post(`/cases/${caseId}/report`, reportData);
      return response;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  async updateCase(caseId: string, caseData: Partial<Case>): Promise<Case> {
    try {
      const response = await api.put(`/cases/${caseId}`, caseData);
      return response;
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  },
};