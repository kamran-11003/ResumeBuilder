import React from 'react';

export default function PDFPreview({ pdfUrl }: { pdfUrl: string | null }) {
  if (!pdfUrl) {
    return <div className="w-full h-full flex items-center justify-center text-gray-400">No PDF to preview</div>;
  }
  return (
    <iframe
      src={pdfUrl}
      className="w-full h-full border-0"
      title="Resume Preview"
    />
  );
} 