// Firebase Storage Methods
// Reusable methods for file upload/download/delete

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadResult,
  UploadTask
} from 'firebase/storage';
import { storage } from './index';

// ==================== UPLOAD ====================

/**
 * Upload a file to Firebase Storage
 * @param file - File to upload
 * @param path - Storage path (e.g., 'inspections/pre/booking-id/image.jpg')
 * @returns Download URL of the uploaded file
 */
export const uploadFile = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload a file with progress tracking
 * @param file - File to upload
 * @param path - Storage path
 * @param onProgress - Callback for upload progress (0-100)
 * @returns Download URL of the uploaded file
 */
export const uploadFileWithProgress = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error('Error uploading file:', error);
        reject(error);
      },
      async () => {
        // Upload completed successfully, get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Upload multiple files
 * @param files - Array of files to upload
 * @param basePath - Base storage path (file names will be appended)
 * @returns Array of download URLs
 */
export const uploadMultipleFiles = async (
  files: File[],
  basePath: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return uploadFile(file, path);
    });

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

// ==================== DOWNLOAD ====================

/**
 * Get download URL for a file
 * @param path - Storage path
 * @returns Download URL
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// ==================== DELETE ====================

/**
 * Delete a file from storage
 * @param path - Storage path
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Delete multiple files
 * @param paths - Array of storage paths
 */
export const deleteMultipleFiles = async (paths: string[]): Promise<void> => {
  try {
    const deletePromises = paths.map(path => deleteFile(path));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
};

/**
 * Delete all files in a folder
 * @param folderPath - Folder path in storage
 */
export const deleteFolder = async (folderPath: string): Promise<void> => {
  try {
    const folderRef = ref(storage, folderPath);
    const listResult = await listAll(folderRef);

    // Delete all files in the folder
    const deletePromises = listResult.items.map(item => deleteObject(item));
    await Promise.all(deletePromises);

    // Recursively delete subfolders
    const subfolderPromises = listResult.prefixes.map(prefix =>
      deleteFolder(prefix.fullPath)
    );
    await Promise.all(subfolderPromises);
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// ==================== UTILITIES ====================

/**
 * List all files in a folder
 * @param folderPath - Folder path in storage
 * @returns Array of file paths
 */
export const listFiles = async (folderPath: string): Promise<string[]> => {
  try {
    const folderRef = ref(storage, folderPath);
    const listResult = await listAll(folderRef);
    return listResult.items.map(item => item.fullPath);
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Generate a unique file path for inspection images
 * @param bookingId - Booking ID
 * @param inspectionType - 'pre' or 'post'
 * @param fileName - Original file name
 * @returns Unique storage path
 */
export const generateInspectionImagePath = (
  bookingId: string,
  inspectionType: 'pre' | 'post',
  fileName: string
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `inspections/${inspectionType}/${bookingId}/${timestamp}_${sanitizedFileName}`;
};
