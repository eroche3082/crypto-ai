import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Mic, Camera, QrCode, RotateCcw, FileText, 
  Languages, Lightbulb, Box, History
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatToolbarProps {
  onToolClick: (tool: 'audio' | 'camera' | 'qr' | 'ar' | 'prompt' | 'clear' | 'summary' | 'translate' | 'history') => void;
  vertical?: boolean;
  className?: string;
  messagesCount?: number;
}

const ChatToolbar = ({ 
  onToolClick, 
  vertical = false, 
  className = "",
  messagesCount = 0 
}: ChatToolbarProps) => {
  
  const tools = [
    { icon: <Mic className="h-4 w-4" />, name: 'audio', tooltip: 'Voice Input', active: true },
    { icon: <Camera className="h-4 w-4" />, name: 'camera', tooltip: 'Image Analysis', active: true },
    { icon: <QrCode className="h-4 w-4" />, name: 'qr', tooltip: 'QR Scanner', active: true },
    { icon: <Box className="h-4 w-4" />, name: 'ar', tooltip: 'AR Viewer', active: true },
    { icon: <Lightbulb className="h-4 w-4" />, name: 'prompt', tooltip: 'Prompt Ideas', active: true },
  ];
  
  const actions = [
    { icon: <RotateCcw className="h-4 w-4" />, name: 'clear', tooltip: 'Clear Chat', active: true },
    { icon: <FileText className="h-4 w-4" />, name: 'summary', tooltip: 'Summarize Chat', active: messagesCount > 1 },
    { icon: <Languages className="h-4 w-4" />, name: 'translate', tooltip: 'Translate Last Message', active: messagesCount > 0 },
    { icon: <History className="h-4 w-4" />, name: 'history', tooltip: 'Chat History', active: true },
  ];
  
  const renderToolButton = (tool: any) => (
    <TooltipProvider key={tool.name} delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${!tool.active ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
            onClick={() => tool.active && onToolClick(tool.name as any)}
            disabled={!tool.active}
          >
            {tool.icon}
            {tool.badge && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">{tool.badge}</Badge>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tool.tooltip}</p>
          {!tool.active && <p className="text-xs text-muted-foreground">Not available</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  if (vertical) {
    return (
      <div className={`flex flex-col items-center space-y-3 p-2 ${className}`}>
        {tools.map(renderToolButton)}
        <div className="w-full h-px bg-border my-1" />
        {actions.map(renderToolButton)}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {tools.map(renderToolButton)}
      <div className="w-px h-6 bg-border mx-1" />
      {actions.map(renderToolButton)}
    </div>
  );
};

export default ChatToolbar;