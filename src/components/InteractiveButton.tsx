// Create a new file: src/components/InteractiveButton.tsx
'use client'

import React from 'react'

interface InteractiveButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default function InteractiveButton({ onClick, children }: InteractiveButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      {children}
    </button>
  )
}