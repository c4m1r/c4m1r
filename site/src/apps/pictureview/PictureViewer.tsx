/**
 * Универсальный просмотрщик изображений для всех тем
 * Поддерживает: zoom, rotate, базовые операции
 */

import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Save, Printer, Trash2 } from 'lucide-react';

interface PictureViewerProps {
  initialImage?: string;
  onClose?: () => void;
}

export function PictureViewer({ initialImage, onClose }: PictureViewerProps) {
  const { theme } = useApp();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
  const handleRotateCw = () => setRotation(prev => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation(prev => (prev - 90 + 360) % 360);

  return (
    <div className="flex flex-col h-full bg-[#eef2fb]">
      {/* Toolbar */}
      <div className="h-10 bg-[#eef2fb] border-b border-[#aca899] flex items-center justify-center gap-2 px-2 shadow-sm">
        <button onClick={handleZoomIn} className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Zoom In">
          <ZoomIn size={20} className="text-[#1d5289]" />
        </button>
        <button onClick={handleZoomOut} className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Zoom Out">
          <ZoomOut size={20} className="text-[#1d5289]" />
        </button>
        <div className="w-px h-6 bg-[#aca899] mx-1" />
        <button onClick={handleRotateCcw} className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Rotate Left">
          <RotateCcw size={20} className="text-[#1d5289]" />
        </button>
        <button onClick={handleRotateCw} className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Rotate Right">
          <RotateCw size={20} className="text-[#1d5289]" />
        </button>
        <div className="w-px h-6 bg-[#aca899] mx-1" />
        <button className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Delete">
          <Trash2 size={20} className="text-[#1d5289]" />
        </button>
        <button className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Print">
          <Printer size={20} className="text-[#1d5289]" />
        </button>
        <button className="p-1 hover:bg-[#ffe7a2] border border-transparent hover:border-[#d2c08e] rounded" title="Save">
          <Save size={20} className="text-[#1d5289]" />
        </button>
      </div>

      {/* Image Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {initialImage ? (
          <img
            src={initialImage}
            alt="View"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out',
              maxWidth: '100%',
              maxHeight: '100%',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
            }}
          />
        ) : (
          <div className="text-gray-500">No image selected</div>
        )}
      </div>
    </div>
  );
}

