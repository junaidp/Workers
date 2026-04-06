import { 
  Wrench, 
  Zap, 
  Droplets, 
  Wind, 
  Hammer, 
  Home, 
  Paintbrush, 
  Drill,
  Sun,
  Tv,
  Wifi,
  Camera,
  Lock,
  Leaf,
  Truck,
  Package,
  Settings,
  Tool,
  HardHat,
  Lightbulb,
  Flame,
  Snowflake,
  Scissors,
  Bath,
  DoorOpen,
  Fence
} from 'lucide-react'

// Map service names to appropriate icons
export const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase()
  
  // Electrical services
  if (name.includes('electric') || name.includes('wiring')) {
    return Zap
  }
  
  // Plumbing services
  if (name.includes('plumb') || name.includes('pipe') || name.includes('drain') || name.includes('water')) {
    return Droplets
  }
  
  // HVAC/AC services
  if (name.includes('ac ') || name.includes('air condition') || name.includes('hvac') || name.includes('cooling')) {
    return Wind
  }
  
  if (name.includes('heating') || name.includes('heater') || name.includes('furnace')) {
    return Flame
  }
  
  if (name.includes('refrigerat')) {
    return Snowflake
  }
  
  // Solar services
  if (name.includes('solar') || name.includes('panel')) {
    return Sun
  }
  
  // Painting services
  if (name.includes('paint') || name.includes('decorator')) {
    return Paintbrush
  }
  
  // Carpentry/Woodwork
  if (name.includes('carpen') || name.includes('wood') || name.includes('furniture')) {
    return Hammer
  }
  
  // Construction/Masonry
  if (name.includes('mason') || name.includes('brick') || name.includes('construct') || name.includes('building')) {
    return HardHat
  }
  
  // Home appliances
  if (name.includes('appliance') || name.includes('washing machine') || name.includes('refrigerator') || name.includes('oven')) {
    return Package
  }
  
  // TV/Electronics
  if (name.includes('tv') || name.includes('television') || name.includes('electronic')) {
    return Tv
  }
  
  // Internet/Networking
  if (name.includes('internet') || name.includes('network') || name.includes('wifi') || name.includes('router')) {
    return Wifi
  }
  
  // Security/CCTV
  if (name.includes('security') || name.includes('cctv') || name.includes('camera') || name.includes('alarm')) {
    return Camera
  }
  
  if (name.includes('lock')) {
    return Lock
  }
  
  // Gardening/Landscaping
  if (name.includes('garden') || name.includes('landscape') || name.includes('lawn') || name.includes('tree')) {
    return Leaf
  }
  
  // Moving/Transportation
  if (name.includes('moving') || name.includes('transport') || name.includes('delivery')) {
    return Truck
  }
  
  // Handyman/General
  if (name.includes('handyman') || name.includes('general') || name.includes('maintenance')) {
    return Tool
  }
  
  // Geyser
  if (name.includes('geyser')) {
    return Lightbulb
  }
  
  // Bathroom
  if (name.includes('bathroom') || name.includes('toilet') || name.includes('shower')) {
    return Bath
  }
  
  // Doors/Windows
  if (name.includes('door') || name.includes('window')) {
    return DoorOpen
  }
  
  // Fencing/Gates
  if (name.includes('fence') || name.includes('gate') || name.includes('railing')) {
    return Fence
  }
  
  // Drilling
  if (name.includes('drill') || name.includes('bore')) {
    return Drill
  }
  
  // Cleaning
  if (name.includes('clean') || name.includes('wash')) {
    return Scissors
  }
  
  // Roofing
  if (name.includes('roof') || name.includes('ceiling')) {
    return Home
  }
  
  // Default icon
  return Wrench
}
