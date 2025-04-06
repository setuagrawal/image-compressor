import React, { useState, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Github } from 'lucide-react';

interface CompressedImage {
  original: {
    name: string;
    size: number;
    type: string;
  };
  compressed: {
    size: number;
    url: string;
  };
}

function App() {
  const [image, setImage] = useState<CompressedImage | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [loading, setLoading] = useState<boolean>(false);

  const compressImage = useCallback(async (file: File) => {
    setLoading(true);
    
    return new Promise<CompressedImage>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Maintain aspect ratio while setting max dimensions
          const maxWidth = 1920;
          const maxHeight = 1080;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight * width) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedUrl = canvas.toDataURL(file.type, quality / 100);
          
          // Calculate compressed size
          const compressedSize = Math.round(
            (compressedUrl.length - compressedUrl.indexOf(',') - 1) * 0.75
          );
          
          resolve({
            original: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
            compressed: {
              size: compressedSize,
              url: compressedUrl,
            },
          });
        };
      };
    });
  }, [quality]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (error) {
      console.error('Error compressing image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement('a');
    link.download = `compressed-${image.original.name}`;
    link.href = image.compressed.url;
    link.click();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ImageShrink</h1>
                <p className="text-sm text-gray-500">Free Online Image Compression</p>
              </div>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">View on GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Compress Your Images
            </h2>
            <p className="mt-2 text-gray-600">
              Reduce file size while maintaining quality
            </p>
          </div>

          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label 
                    htmlFor="file-upload"
                    className="flex justify-center items-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                  >
                    <div className="flex items-center space-x-2">
                      <Upload className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-gray-600">
                        Drop files to upload or browse
                      </span>
                    </div>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* Quality Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Compression Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Results */}
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Compressing image...</p>
                  </div>
                )}

                {image && !loading && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Original</h3>
                          <p className="text-sm text-gray-500">{formatSize(image.original.size)}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Compressed</h3>
                          <p className="text-sm text-gray-500">{formatSize(image.compressed.size)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Reduction: {((1 - image.compressed.size / image.original.size) * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <img
                        src={image.compressed.url}
                        alt="Compressed preview"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>

                    <button
                      onClick={handleDownload}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Compressed Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;