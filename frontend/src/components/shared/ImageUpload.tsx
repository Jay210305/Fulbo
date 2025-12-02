import { useState, useRef, useCallback } from 'react';
import { Cloud, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '../../services/upload.api';
import { cn } from '../ui/utils';

interface ImageUploadProps {
  /** Current image URL */
  value?: string;
  /** Callback when image URL changes */
  onChange: (url: string) => void;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Folder for Cloudinary organization */
  folder?: string;
  /** Custom class name for the container */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  folder = 'general',
  className,
  placeholder = 'Haz clic o arrastra una imagen',
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten imágenes (JPEG, PNG, WebP)');
        toast.error('Formato de imagen no válido');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('La imagen debe ser menor a 5MB');
        toast.error('La imagen es demasiado grande');
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const url = await uploadImage(file, folder);
        onChange(url);
        toast.success('Imagen subida correctamente');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al subir imagen';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [folder, onChange]
  );

  // Handle click on container
  const handleClick = () => {
    if (!disabled && !isLoading) {
      inputRef.current?.click();
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isLoading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Handle remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setError(null);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'border-2 border-dashed border-gray-300 rounded-xl p-8',
          'bg-gray-50',
          className
        )}
      >
        <Loader2 className="h-8 w-8 text-[#047857] animate-spin" />
        <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
      </div>
    );
  }

  // Render filled state (with image)
  if (value) {
    return (
      <div
        className={cn(
          'relative rounded-xl overflow-hidden',
          'border-2 border-gray-200',
          'group cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        <img
          src={value}
          alt="Preview"
          className="w-full h-48 object-cover"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-white text-sm">Clic para cambiar</p>
        </div>
        {/* Remove button */}
        {!disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute top-2 right-2',
              'w-8 h-8 rounded-full',
              'bg-red-500 hover:bg-red-600',
              'text-white',
              'flex items-center justify-center',
              'shadow-lg',
              'transition-colors'
            )}
            aria-label="Eliminar imagen"
          >
            <X size={16} />
          </button>
        )}
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Render empty state
  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2',
        'border-2 border-dashed rounded-xl p-8',
        'cursor-pointer transition-colors',
        isDragging
          ? 'border-[#047857] bg-[#047857]/5'
          : 'border-gray-300 hover:border-[#047857]',
        disabled && 'opacity-50 cursor-not-allowed',
        error && 'border-red-500',
        className
      )}
    >
      {error ? (
        <>
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-500 text-center">{error}</p>
          <p className="text-xs text-muted-foreground">Intenta de nuevo</p>
        </>
      ) : (
        <>
          {isDragging ? (
            <ImageIcon className="h-8 w-8 text-[#047857]" />
          ) : (
            <Cloud className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground text-center">
            {isDragging ? 'Suelta la imagen aquí' : placeholder}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WebP - Máximo 5MB
          </p>
        </>
      )}
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
