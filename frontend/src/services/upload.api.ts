// Upload API service for handling file uploads to Cloudinary via backend

const API_BASE_URL = 'http://localhost:4000/api';

interface UploadResponse {
  url: string;
}

interface MultiUploadResponse {
  urls: string[];
}

/**
 * Upload a single image file to the server
 * @param file - The file to upload
 * @param folder - Optional folder name for organization (fields, products, avatars)
 * @returns The Cloudinary URL of the uploaded image
 */
export async function uploadImage(file: File, folder?: string): Promise<string> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  const formData = new FormData();
  formData.append('image', file);

  const url = folder 
    ? `${API_BASE_URL}/upload?folder=${folder}` 
    : `${API_BASE_URL}/upload`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: Don't set Content-Type here, browser will set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al subir imagen');
  }

  const data: UploadResponse = await response.json();
  return data.url;
}

/**
 * Upload multiple image files to the server
 * @param files - Array of files to upload (max 5)
 * @param folder - Optional folder name for organization
 * @returns Array of Cloudinary URLs
 */
export async function uploadMultipleImages(files: File[], folder?: string): Promise<string[]> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  if (files.length > 5) {
    throw new Error('Máximo 5 imágenes por carga');
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const url = folder 
    ? `${API_BASE_URL}/upload/multi?folder=${folder}` 
    : `${API_BASE_URL}/upload/multi`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al subir imágenes');
  }

  const data: MultiUploadResponse = await response.json();
  return data.urls;
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - The URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar imagen');
  }
}
