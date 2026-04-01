import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';

const DoctorProfileUpload = ({ doctorId, currentDpUrl, onUpdateSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentDpUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else {
      toast.error('Please drop a valid image file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !doctorId) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsUploading(true);
      const { data } = await API.post(`/doctors/${doctorId}/upload-dp`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile picture updated successfully');
      setSelectedFile(null);
      if (onUpdateSuccess) {
        onUpdateSuccess(data.dp_url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const msg = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDp = async () => {
    if (!doctorId || !window.confirm('Are you sure you want to delete this profile photo?')) return;

    try {
      setIsUploading(true);
      await API.delete(`/doctors/${doctorId}/dp`);

      toast.success('Profile picture removed');
      setPreviewUrl(null);
      if (onUpdateSuccess) {
        onUpdateSuccess(null);
      }
    } catch (error) {
      console.error('Delete DP failed:', error);
      const msg = error.response?.data?.message || 'Failed to remove profile picture';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(currentDpUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        className="relative group"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* AVATAR CONTAINER */}
        <motion.div
          animate={{ 
            scale: isDragging ? 1.05 : 1,
            borderColor: isDragging ? '#2563eb' : '#f1f5f9'
          }}
          className={`relative w-32 h-32 rounded-full border-4 overflow-hidden bg-slate-50 shadow-inner flex items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-dashed' : 'border-slate-100 shadow-slate-200/50'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={48} className="text-slate-300" />
          )}

          {/* HOVER OVERLAY */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-1">
            <Camera size={24} className="text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
          </div>

          {/* UPLOADING OVERLAY */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
              >
                <Loader2 size={32} className="text-blue-600 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* DRAG FEEDBACK INDICATOR */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -inset-2 border-2 border-blue-500 rounded-full border-dashed pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* FILE INPUT HIDDEN */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* ACTION BUTTONS */}
      <AnimatePresence>
        {selectedFile && !isUploading ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check size={14} />
              Save Changes
            </button>
          </motion.div>
        ) : !selectedFile && currentDpUrl && !isUploading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={handleDeleteDp}
              className="px-4 py-2 text-rose-500 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <X size={14} />
              Remove Photo
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!selectedFile && !isUploading && !currentDpUrl && (
        <p className="text-[11px] font-medium text-slate-400 text-center max-w-[200px]">
          Click or drop an image here to update the specialist's profile picture
        </p>
      )}

    </div>
  );
};

export default DoctorProfileUpload;
