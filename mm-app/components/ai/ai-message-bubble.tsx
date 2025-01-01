import React from 'react';
import { cn } from '@/lib/utils/class-utils';

interface AIMessageBubbleProps {
  message: string;
  type?: 'default' | 'success' | 'error';
  className?: string;
  onDismiss?: () => void;
  onClick?: () => void;
}

export const AIMessageBubble = ({ 
  message, 
  type = 'default', 
  className,
  onDismiss,
  onClick 
}: AIMessageBubbleProps) => {
  return (
    <div 
      role="alert"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        // Base styles
        "relative p-4 rounded-lg shadow-lg max-w-[300px]",
        // Animation
        "animate-in slide-in-from-bottom-right duration-300 ease-out",
        // Interactive
        "cursor-pointer hover:scale-[1.02] transition-transform",
        // Positioning
        "origin-bottom-right",
        // Colors and theme
        type === 'default' && "bg-white/95 text-gray-900 border border-blue-100",
        type === 'success' && "bg-green-50/95 text-green-900 border border-green-200",
        type === 'error' && "bg-red-50/95 text-red-900 border border-red-200",
        // Speech bubble tail
        "after:content-[''] after:absolute after:bottom-[-8px] after:right-4",
        "after:w-4 after:h-4 after:rotate-45 after:transition-colors",
        "after:border-r after:border-b",
        type === 'default' && "after:bg-white after:border-blue-100",
        type === 'success' && "after:bg-green-50 after:border-green-200",
        type === 'error' && "after:bg-red-50 after:border-red-200",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{message}</p>
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss message"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}; 