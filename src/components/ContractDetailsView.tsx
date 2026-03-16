import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Clock, DollarSign, User, Mail, Phone, FileText, AlertCircle } from 'lucide-react';
import ContractDocuments from './ContractDocuments';

interface ContractDetailsViewProps {
  contractId: string;
  onBack?: () => void;
}

interface Contract {
  id: string;
  contract_number: string;
  client_name: string;
  client_contact_person?: string;
  client_email?: string;
  contract_amount: number;
  currency_code: string;
  contract_start_date: string;
  contract_end_date: string;
  contract_document_url?: string;
  status: string;
  created_at: string;
}

interface Milestone {
  id: string;
  milestone_name: string;
  percentage_of_contract: number;
  amount_ugx: number;
  due_date: string;
  status: string;
  milestone_budget?: number;
}

export default function ContractDetailsView({ contractId, onBack }: ContractDetailsViewProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentViewUrl, setDocumentViewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch contract
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;
      setContract(contractData);

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('contract_milestones')
        .select('*')
        .eq('contract_id', contractId)
        .order('milestone_number', { ascending: true });

      if (milestonesError) throw milestonesError;
      setMilestones(milestonesData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      'photo_verified': 'bg-purple-100 text-purple-800',
      invoiced: 'bg-indigo-100 text-indigo-800',
      paid: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="bg-white rounded-lg p-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Error Loading Contract</h3>
            <p className="text-red-700 text-sm mb-4">{error || 'Contract not found'}</p>
            {onBack && (
              <button
                onClick={onBack}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                ← Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(contract.contract_end_date);
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.client_name}</h1>
            <p className="text-gray-600 text-sm">Contract #{contract.contract_number}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
        </span>
      </div>

      {/* Alerts */}
      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Contract Expired</p>
            <p className="text-red-700 text-sm">This contract expired on {formatDate(contract.contract_end_date)}</p>
          </div>
        </div>
      )}
      {isExpiringSoon && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">Contract Expiring Soon</p>
            <p className="text-yellow-700 text-sm">
              {daysRemaining} days remaining until {formatDate(contract.contract_end_date)}
            </p>
          </div>
        </div>
      )}

      {/* Contract Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">Contract Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: contract.currency_code 
            }).format(contract.contract_amount)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">Start Date</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(contract.contract_start_date)}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">End Date</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(contract.contract_end_date)}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">Days Remaining</p>
          <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
            {daysRemaining} days
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Client Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contract.client_contact_person && (
            <div>
              <p className="text-gray-600 text-sm font-medium">Contact Person</p>
              <p className="text-gray-900 font-semibold">{contract.client_contact_person}</p>
            </div>
          )}
          {contract.client_email && (
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-gray-600 text-sm font-medium">Email</p>
                <a href={`mailto:${contract.client_email}`} className="text-blue-600 hover:underline">
                  {contract.client_email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Milestones ({milestones.length})
          </h2>
          <div className="space-y-3">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white ${
                    milestone.status === 'paid' ? 'bg-green-600' :
                    milestone.status === 'photo_verified' ? 'bg-purple-600' :
                    milestone.status === 'invoiced' ? 'bg-indigo-600' :
                    'bg-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{milestone.milestone_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {milestone.percentage_of_contract}% of contract ({new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: contract.currency_code
                        }).format(milestone.amount_ugx)})
                      </p>
                      {milestone.milestone_budget && (
                        <p className="text-sm text-blue-600 mt-1">
                          Budget: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: contract.currency_code
                          }).format(milestone.milestone_budget)}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {milestone.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Due: {formatDate(milestone.due_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Documents */}
      <ContractDocuments
        contractId={contract.id}
        contractNumber={contract.contract_number}
        contractDocumentUrl={contract.contract_document_url}
        clientEmail={contract.client_email}
        onDocumentView={setDocumentViewUrl}
      />

      {/* Document Viewer Modal */}
      {documentViewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Contract Document</h3>
              <button
                onClick={() => setDocumentViewUrl(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                src={documentViewUrl}
                className="w-full h-full"
                title="Contract Document"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
