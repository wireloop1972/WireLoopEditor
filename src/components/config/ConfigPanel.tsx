'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import Button, { buttonVariants } from '@/components/ui/Button';

interface ConfigPanelProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ConfigPanel({ 
  title, 
  children, 
  isOpen = false, 
  onClose 
}: ConfigPanelProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        {title}
      </Button>

      {isVisible && (
        <div className="absolute right-0 top-12 w-96 bg-black/90 border border-orange-500/20 rounded-lg p-6 backdrop-blur-sm z-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-orange-500">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
} 