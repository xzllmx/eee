import React, { useState } from 'react';
import { Download, Share2, FileText, Eye, Trash2, Upload, File, AlertCircle } from 'lucide-react';

interface ContractDocumentsProps {
  contractId: string;
  contractNumber: string;
  contractDocumentUrl?: string | null;
  clientEmail?: string;
  onDocumentView?: (url: string) => void;
}

export default function ContractDocuments({
  contractId,
  contractNumber,
  contractDocumentUrl,
  clientEmail,
  onDocumentView
}: ContractDocumentsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState(clientEmail || '');
  const [shareMessage, setShareMessage] = useState('');
  const [sharedWith, setSharedWith] = useState<Array<{ email: string; sharedAt: string }>>([]);

  const handleDownload = () => {
    if (contractDocumentUrl) {
      const link = document.createElement('a');
      link.href = contractDocumentUrl;
      link.download = `Contract-${contractNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareContract = () => {
    if (shareEmail) {
      // In a real implementation, this would send an email via an API
      setSharedWith([...sharedWith, { email: shareEmail, sharedAt: new Date().toISOString() }]);
      setShareEmail('');
      setShareMessage('');
      setShowShareModal(false);
      // Show toast notification
      console.log(`Contract shared with ${shareEmail}`);
    }
  };

  const getFileType = (url: string) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop()?.toLowerCase() || '';
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'jpg': 'Image (JPG)',
      'png': 'Image (PNG)',
      'jpeg': 'Image (JPEG)',
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  const getFileSize = (url: string) => {
    // In production, this would come from metadata
    return 'Size: Check server';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Contract Documents
      </h3>

      {/* Main Contract Document */}
      {contractDocumentUrl ? (
        <div className="space-y-4">
          {/* Primary Document Card */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <File className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Main Contract Document</p>
                  <p className="text-sm text-gray-600 mt-1">{getFileType(contractDocumentUrl)}</p>
                  <p className="text-xs text-gray-500 mt-1">Contract #{contractNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Uploaded
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200">
              <button
                onClick={() => onDocumentView?.(contractDocumentUrl)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Shared With Section */}
          {sharedWith.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Shared With</h4>
              <div className="space-y-2">
                {sharedWith.map((share, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{share.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(share.sharedAt).toLocaleDateString()} {new Date(share.sharedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No contract document uploaded yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Upload a signed or scanned copy of the contract for reference
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 mx-auto">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      )}

      {/* Attachments Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" />
          Attachments & Supporting Documents
        </h4>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No additional documents</p>
          <p className="text-sm text-gray-500 mb-4">
            Upload contract amendments, SOWs, specifications, or other supporting documents
          </p>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-2 mx-auto">
            <Upload className="w-4 h-4" />
            Add Attachment
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Contract</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareContract}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Share Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
