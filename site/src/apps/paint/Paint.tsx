import { useRef, useState, useEffect } from 'react';

export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = [
    '#000000', '#808080', '#800000', '#FF0000',
    '#808000', '#FFFF00', '#008000', '#00FF00',
    '#008080', '#00FFFF', '#000080', '#0000FF',
    '#800080', '#FF00FF', '#FFFFFF', '#C0C0C0',
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#ece9d8]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b-2 border-[#d4d0c8]">
        <button
          onClick={() => setTool('brush')}
          className={`px-3 py-1 border-2 ${tool === 'brush' ? 'border-black bg-white' : 'border-white border-b-[#808080] border-r-[#808080] bg-[#ece9d8]'} hover:bg-[#d4d0c8]`}
          title="Brush"
        >
          🖌️
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-1 border-2 ${tool === 'eraser' ? 'border-black bg-white' : 'border-white border-b-[#808080] border-r-[#808080] bg-[#ece9d8]'} hover:bg-[#d4d0c8]`}
          title="Eraser"
        >
          🧹
        </button>
        <div className="w-px h-6 bg-[#808080]" />
        <button
          onClick={clearCanvas}
          className="px-3 py-1 border-2 border-white border-b-[#808080] border-r-[#808080] bg-[#ece9d8] hover:bg-[#d4d0c8]"
          title="Clear"
        >
          🗑️
        </button>
        <div className="w-px h-6 bg-[#808080]" />
        <label className="flex items-center gap-2">
          <span className="text-sm">Size:</span>
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="border-2 border-[#5c5c5c] bg-white px-2 py-1"
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={4}>4px</option>
            <option value={8}>8px</option>
            <option value={12}>12px</option>
            <option value={16}>16px</option>
          </select>
        </label>
      </div>

      {/* Color Palette */}
      <div className="flex flex-wrap gap-1 p-2 border-b-2 border-[#d4d0c8]">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setCurrentColor(color)}
            className={`w-6 h-6 border-2 ${currentColor === color ? 'border-black' : 'border-[#808080]'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-2 overflow-auto bg-[#d4d0c8]">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white border-2 border-[#5c5c5c] cursor-crosshair"
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 py-1 border-t-2 border-white bg-[#ece9d8] text-xs">
        <span>Tool: {tool === 'brush' ? 'Brush' : 'Eraser'}</span>
        <span>Color: {currentColor}</span>
        <span>Size: {brushSize}px</span>
      </div>
    </div>
  );
}

