import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TrustConsentManagerProps {
  // Props from context
}

export default function TrustConsentManager(_props: TrustConsentManagerProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Trust & Consent</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
          <span className="text-sm">Evidence Upload</span>
          <span className="text-xs text-green-700">✓ Allowed</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
          <span className="text-sm">OCR Processing</span>
          <span className="text-xs text-green-700">✓ Allowed</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
          <span className="text-sm">Voice Recording</span>
          <span className="text-xs text-yellow-700">⚠ Not configured</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
          <span className="text-sm">AI Recommendations</span>
          <span className="text-xs text-green-700">✓ Allowed</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
          <span className="text-sm">Auto-Execution</span>
          <span className="text-xs text-red-700">✗ Denied</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Trust Contract v1.0.0</p>
        <p className="mt-1">All data stored locally by default</p>
      </div>
    </div>
  );
}
