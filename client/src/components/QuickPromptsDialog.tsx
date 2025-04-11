import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuickPrompts from "./QuickPrompts";

interface QuickPromptsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

const QuickPromptsDialog = ({ isOpen, onClose, onSelectPrompt }: QuickPromptsDialogProps) => {
  const handlePromptSelect = (promptText: string) => {
    onSelectPrompt(promptText);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Prompt Ideas</DialogTitle>
          <DialogDescription>
            Choose a pre-defined prompt to start a conversation
          </DialogDescription>
        </DialogHeader>
        <QuickPrompts onSelectPrompt={handlePromptSelect} inDialog={true} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default QuickPromptsDialog;