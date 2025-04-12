import {
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Check,
  Trash,
  Home,
  Star,
  Settings,
  LogOut,
  Send,
  MoreVertical,
  Loader2,
  Copy,
  Camera,
  Mic,
  QrCode,
  Maximize,
  Minimize,
  VolumeX,
  Volume2,
  Bot,
  User,
  Lock,
  Info,
  AlertCircle,
  AlertTriangle,
  Bell,
  FileText,
  Image,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  Minus,
  Download,
  Share,
  Calendar,
  RefreshCw,
  Globe,
  ExternalLink,
  Package,
  type LucideIcon,
  FileQuestion
} from "lucide-react";

export type Icon = LucideIcon;

// Custom VR icon
const VrIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    <path d="M15 14v4" />
    <path d="M9 14v4" />
    <path d="M9 18h6" />
    <path d="M7 6h10" />
    <path d="M7 9h10" />
  </svg>
);

// Custom logo icon
const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
    <path d="M12 14l2-2 1 1 2-2" />
  </svg>
);

// Common pattern for icon exports
export const Icons = {
  logo: LogoIcon,
  close: X,
  menu: Menu,
  check: Check,
  trash: Trash,
  home: Home,
  star: Star,
  settings: Settings,
  logout: LogOut,
  send: Send,
  more: MoreVertical,
  spinner: Loader2,
  copy: Copy,
  camera: Camera,
  mic: Mic,
  qrCode: QrCode,
  maximize: Maximize,
  minimize: Minimize,
  volumeOff: VolumeX,
  volumeOn: Volume2,
  bot: Bot,
  user: User,
  lock: Lock,
  info: Info,
  alert: AlertCircle,
  warning: AlertTriangle,
  notification: Bell,
  document: FileText,
  image: Image,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  search: Search,
  plus: Plus,
  minus: Minus,
  download: Download,
  share: Share,
  calendar: Calendar,
  refresh: RefreshCw,
  globe: Globe,
  externalLink: ExternalLink,
  cube: Package,
  upload: Download,
  vr: VrIcon,
  help: FileQuestion,
  
  // Navigation
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // AI Provider icons with brand colors
  gemini: () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
    </svg>
  ),
  
  openai: () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  
  claude: () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8l2 2 4-4" />
      <path d="M5 16l2 2 4-4" />
      <path d="M13 12h6" />
    </svg>
  ),
};