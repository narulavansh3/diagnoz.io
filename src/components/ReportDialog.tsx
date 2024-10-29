import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Case } from '../services/cases';
import Button from './Button';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { findings: string; impression: string }) => void;
  case: Case;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  case: caseData,
}) => {
  const [formData, setFormData] = useState({
    findings: '',
    impression: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Submit Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium">Case Details</h3>
          <p className="text-sm text-gray-600">Patient: {caseData.patientName}</p>
          <p className="text-sm text-gray-600">Modality: {caseData.modality}</p>
          <p className="text-sm text-gray-600">Clinical History: {caseData.clinicalHistory}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Findings
            </label>
            <textarea
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
              rows={6}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impression
            </label>
            <textarea
              value={formData.impression}
              onChange={(e) => setFormData({ ...formData, impression: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDialog;