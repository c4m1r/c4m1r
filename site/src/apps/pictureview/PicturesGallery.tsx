/**
 * Галерея изображений - Мои изображения
 * Динамически загружает изображения из content/pictures
 */

import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { loadPictures, type ImageItem } from '../../utils/contentLoader';
import { Grid, List, ZoomIn } from 'lucide-react';

interface PicturesGalleryProps {
  onOpenImage?: (imagePath: string) => void;
}

export function PicturesGallery({ onOpenImage }: PicturesGalleryProps) {
  const { theme } = useApp();
  const [pictures, setPictures] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isXpFamily = theme !== 'win-98';

  useEffect(() => {
    loadPictures().then(pics => {
      setPictures(pics);
      setLoading(false);
    });
  }, []);

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image.id);
  };

  const handleImageDoubleClick = (image: ImageItem) => {
    if (onOpenImage) {
      onOpenImage(image.path);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="text-lg mb-2">Загрузка изображений...</div>
          <div className="text-sm text-gray-500">Пожалуйста, подождите</div>
        </div>
      </div>
    );
  }

  if (pictures.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">Нет изображений</div>
          <div className="text-sm">Папка пуста</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className={`flex items-center justify-between p-2 border-b ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white border border-gray-400' : 'hover:bg-white/50'}`}
            title="Grid View"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-white border border-gray-400' : 'hover:bg-white/50'}`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {pictures.length} {pictures.length === 1 ? 'изображение' : 'изображений'}
        </div>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
            {pictures.map((image) => (
              <div
                key={image.id}
                className={`flex flex-col items-center cursor-pointer border-2 p-2 rounded ${
                  selectedImage === image.id
                    ? 'border-[#316ac5] bg-[#316ac5]/10'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleImageClick(image)}
                onDoubleClick={() => handleImageDoubleClick(image)}
              >
                <div className="w-full aspect-square mb-2 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                  <img
                    src={image.thumbnail || image.path}
                    alt={image.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className={`text-xs text-center break-words w-full ${selectedImage === image.id ? 'bg-[#316ac5] text-white px-1 rounded' : ''}`}>
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className={`${isXpFamily ? 'bg-[#ece9d8]' : 'bg-[#c0c0c0]'}`}>
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Название</th>
                <th className="text-left px-3 py-2 font-semibold w-32">Размер</th>
                <th className="text-left px-3 py-2 font-semibold w-40">Дата</th>
              </tr>
            </thead>
            <tbody>
              {pictures.map((image) => (
                <tr
                  key={image.id}
                  className={`cursor-pointer ${
                    selectedImage === image.id
                      ? 'bg-[#316ac5] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleImageClick(image)}
                  onDoubleClick={() => handleImageDoubleClick(image)}
                >
                  <td className="px-3 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 flex-shrink-0">
                      <img
                        src={image.thumbnail || image.path}
                        alt={image.name}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                    <span>{image.name}</span>
                  </td>
                  <td className="px-3 py-2">{image.size || '—'}</td>
                  <td className="px-3 py-2">{image.date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

