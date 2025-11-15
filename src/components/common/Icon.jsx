/**
 * Icon komponent - Wrapper for lucide-react ikoner
 * Erstat emojis med professionelle ikoner
 */

import {
  Smartphone,
  CreditCard,
  Tag,
  Search,
  Camera,
  Rocket,
  Sparkles,
  Wallet,
  Lock,
  Unlock,
  RefreshCw,
  Gift,
  Tv,
  Check,
  Plus,
  AlertTriangle,
  User,
  Briefcase,
  Zap,
  CheckCircle2,
  Sun,
  Moon,
  RotateCcw,
  ShoppingCart,
  Film,
  Users,
  Info,
  Presentation,
  Printer,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  X,
  ScanLine,
  Flashlight,
  FlashlightOff,
  Book,
  HelpCircle,
  Star,
  TrendingDown,
  Settings
} from 'lucide-react';

const iconMap = {
  // Mobil og abonnementer
  smartphone: Smartphone,
  mobile: Smartphone,
  phone: Smartphone,
  
  // Finans
  creditCard: CreditCard,
  wallet: Wallet,
  money: Wallet,
  
  // Priser og produkter
  tag: Tag,
  price: Tag,
  
  // Søgning
  search: Search,
  scan: ScanLine,
  camera: Camera,
  
  // Actions
  rocket: Rocket,
  sparkles: Sparkles,
  lock: Lock,
  unlock: Unlock,
  refresh: RefreshCw,
  reset: RotateCcw,
  gift: Gift,
  
  // Streaming og media
  tv: Tv,
  streaming: Tv,
  film: Film,
  
  // Status
  check: Check,
  checkCircle: CheckCircle2,
  plus: Plus,
  warning: AlertTriangle,
  error: AlertTriangle,
  
  // Personer
  user: User,
  customer: User,
  users: Users,
  family: Users,
  
  // Business
  briefcase: Briefcase,
  offer: Briefcase,
  
  // UI
  zap: Zap,
  lightning: Zap,
  sun: Sun,
  moon: Moon,
  cart: ShoppingCart,
  info: Info,
  presentation: Presentation,
  print: Printer,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  arrowRight: ChevronRight,
  arrowLeft: ChevronLeft,
  chart: BarChart3,
  analytics: BarChart3,
  close: X,
  x: X,
  torch: Flashlight,
  torchOff: FlashlightOff,
  book: Book,
  helpCircle: HelpCircle,
  help: HelpCircle,
  star: Star,
  trendingDown: TrendingDown,
  settings: Settings
};

export default function Icon({ name, size = 20, className = '', style = {}, ...props }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Return null for unknown icons - silent fail
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className}
      style={style}
      {...props}
    />
  );
}

export { iconMap };

