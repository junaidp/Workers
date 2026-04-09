import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

interface ServiceImageUploadProps {
  serviceId: string
  serviceName: string
  currentImage?: string
  onSuccess: () => void
  onClose: () => void
}

export default function ServiceImageUpload({ 
  serviceId, 
  serviceName, 
  currentImage,
  onSuccess, 
  onClose 
}: ServiceImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error('Please select an image')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      await api.put(`/admin/service/${serviceId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Service image updated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Service Image
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Service: <span className="font-medium">{serviceName}</span></p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to select image</p>
            <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
          </button>
        </div>

        {preview && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {currentImage && !preview && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
            <img
              src={currentImage}
              alt="Current"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn btn-outline btn-md"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="flex-1 btn btn-primary btn-md"
            disabled={uploading || !fileInputRef.current?.files?.[0]}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
