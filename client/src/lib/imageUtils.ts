export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return ''
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Ensure imagePath starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  // In development, use proxy (relative path)
  // In production, use the full API URL
  const apiUrl = import.meta.env.VITE_API_URL
  
  if (apiUrl) {
    // Production: use full URL without /api suffix
    const baseUrl = apiUrl.replace(/\/api$/, '')
    return `${baseUrl}${path}`
  }
  
  // Development: use relative path (will be proxied)
  return path
}
