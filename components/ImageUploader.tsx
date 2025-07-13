import React, { useRef } from 'react';
import * as Icons from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <label
        htmlFor="file-upload"
        className="relative block w-full aspect-[16/10] bg-sky-50/50 rounded-lg border-2 border-dashed border-sky-300 hover:border-orange-400 transition-colors cursor-pointer group"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          {imageUrl ? (
            <img src={imageUrl} alt="Fridge contents" className="w-full h-full object-contain rounded-md" />
          ) : (
            <>
              <Icons.CameraIcon className="w-12 h-12 text-sky-400 group-hover:text-orange-500 transition-colors" />
              <p className="mt-3 font-semibold text-slate-600">
                <span className="text-orange-500 font-bold">Upload a photo</span> or drag and drop
              </p>
              <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
            </>
          )}
        </div>
        <input
          id="file-upload"
          ref={inputRef}
          name="file-upload"
          type="file"
          className="sr-only"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
        />
      </label>
      {imageUrl && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={openFileDialog}
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-800"
          >
            <Icons.ImageIcon className="w-4 h-4" />
            Change Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;