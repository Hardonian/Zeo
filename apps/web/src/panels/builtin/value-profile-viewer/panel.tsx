import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ValueProfileViewerProps {
  // Props from context
}

export default function ValueProfileViewer(_props: ValueProfileViewerProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Value Profile</h2>

      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded">
          <h3 className="font-medium text-blue-900">Objectives</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• Maximize: Deal value</li>
            <li>• Minimize: Risk exposure</li>
            <li>• Preserve: Relationship</li>
          </ul>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <h3 className="font-medium text-green-900">Active Constraints</h3>
          <ul className="text-sm text-green-800 mt-2 space-y-1">
            <li>• Budget limit: $100K</li>
            <li>• Timeline: Q1 2024</li>
            <li>• Legal: Review required</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          Value function: negotiation-default v1.0
        </div>
      </div>
    </div>
  );
}
