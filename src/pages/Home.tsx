import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, UserCog, FileText } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/Button';

interface TestDataResponse {
  message: string;
  success: boolean;
}

const Home = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const populateTestData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await api.post<TestDataResponse>('/test-data');
      setMessage(response.message || 'Test data populated successfully!');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to populate test data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Connect Diagnostic Centers with Radiologists
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Streamline your radiology workflow with our advanced teleradiology platform.
          Connect with qualified radiologists and get reports faster.
        </p>
        
        <div className="mb-8">
          <Button
            onClick={populateTestData}
            isLoading={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Populate Test Data
          </Button>
          {message && (
            <p className={`mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <Building2 className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">For Diagnostic Centers</h2>
          <p className="text-gray-600 mb-4">
            Upload cases and connect with qualified radiologists instantly.
          </p>
          <Link
            to="/center/signup"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Register Center
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <UserCog className="w-12 h-12 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">For Radiologists</h2>
          <p className="text-gray-600 mb-4">
            Access cases from anywhere and provide expert diagnosis.
          </p>
          <Link
            to="/radiologist/signup"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Join as Radiologist
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <FileText className="w-12 h-12 text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Case Management</h2>
          <p className="text-gray-600 mb-4">
            Efficient case tracking and report generation system.
          </p>
          <Link
            to="/login"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            View Cases
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Upload Case</h3>
            <p className="text-gray-600">Centers upload cases with patient details and images</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Radiologist Assignment</h3>
            <p className="text-gray-600">Qualified radiologists accept and review cases</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Report Generation</h3>
            <p className="text-gray-600">Get detailed reports and quick turnaround time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;