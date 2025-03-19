// Create a new file: src/components/InteractiveButton.tsx
'use client'

import React from 'react'

export default function InteractiveButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="...">
      {children}
    </button>
  )
}