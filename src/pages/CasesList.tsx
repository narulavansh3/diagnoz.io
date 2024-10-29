import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle, Clock, User, Building, FileCheck } from 'lucide-react';
import { casesService, Case } from '../services/cases';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ReportDialog from '../components/ReportDialog';

const CasesList = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    fetchCases();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:3001`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'CASE_ACCEPTED':
        case 'REPORT_COMPLETED':
        case 'NEW_CASE':
          fetchCases(); // Refresh the list
          break;
      }
    };

    return () => ws.close();
  };

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      setError('');
      const fetchedCases = await casesService.getCases();
      setCases(fetchedCases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
      console.error('Error fetching cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCase = async (caseId: string) => {
    try {
      setError('');
      await casesService.acceptCase(caseId);
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept case');
      console.error('Error accepting case:', err);
    }
  };

  const handleSubmitReport = async (caseId: string, reportData: any) => {
    try {
      setError('');
      await casesService.submitReport(caseId, reportData);
      setIsReportDialogOpen(false);
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
      console.error('Error submitting report:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return 'text-red-600 bg-red-100';
      case 'URGENT':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'ASSIGNED':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          {user?.role === 'CENTER' ? 'Your Cases' : 'Available Cases'}
        </h1>
        {user?.role === 'CENTER' && (
          <Link to="/case/create">
            <Button>Create New Case</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((case_) => (
          <div key={case_.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">{case_.patientName}</h2>
                <p className="text-gray-600">Age: {case_.patientAge}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(case_.priority)}`}>
                  {case_.priority.toLowerCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(case_.status)}`}>
                  {case_.status.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                <span>{case_.modality}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                <span>{case_.centerName || 'Unknown Center'}</span>
              </div>
              {case_.radiologistName && (
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{case_.radiologistName}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-600 mt-2">
                <p className="font-medium">Clinical History:</p>
                <p className="text-sm">{case_.clinicalHistory}</p>
              </div>
            </div>

            {user?.role === 'RADIOLOGIST' && (
              <div className="space-y-2">
                {case_.status === 'PENDING' && (
                  <Button
                    onClick={() => handleAcceptCase(case_.id)}
                    className="w-full"
                  >
                    Accept Case
                  </Button>
                )}
                {case_.status === 'ASSIGNED' && case_.assigneeId === user.id && (
                  <Button
                    onClick={() => {
                      setSelectedCase(case_);
                      setIsReportDialogOpen(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Submit Report
                  </Button>
                )}
              </div>
            )}

            {case_.status === 'COMPLETED' && case_.findings && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Report</h3>
                <p className="text-sm text-gray-600">{case_.findings}</p>
                <h4 className="font-medium mt-2 mb-1">Impression</h4>
                <p className="text-sm text-gray-600">{case_.impression}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No cases available</h3>
          <p className="text-gray-600">
            {user?.role === 'CENTER' 
              ? 'Create a new case to get started.'
              : 'New cases will appear here when created by diagnostic centers.'}
          </p>
        </div>
      )}

      {isReportDialogOpen && selectedCase && (
        <ReportDialog
          isOpen={isReportDialogOpen}
          onClose={() => {
            setIsReportDialogOpen(false);
            setSelectedCase(null);
          }}
          onSubmit={(reportData) => handleSubmitReport(selectedCase.id, reportData)}
          case={selectedCase}
        />
      )}
    </div>
  );
};

export default CasesList;