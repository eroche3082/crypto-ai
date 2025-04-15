import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { 
  LockKeyhole, 
  ExternalLink, 
  BookOpen, 
  BookText, 
  Info, 
  AlertCircle, 
  HeartHandshake, 
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showLegalDialog, setShowLegalDialog] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  
  const handleLegalLink = (title: string) => {
    setLegalContent({
      title,
      content: `${title} content is coming soon. These documents are currently being reviewed by our legal team and will be available before the official launch.`
    });
    setShowLegalDialog(true);
  };

  return (
    <footer className="border-t py-3 bg-card/40">
      <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center mb-3 md:mb-0">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} CryptoBot AI. All rights reserved.
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-y-3 gap-x-4 justify-center">
          {/* Resources section */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/education">
              <span className="text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center">
                <BookOpen size={14} className="mr-1" />
                Learning Center
              </span>
            </Link>
            <Link href="/news">
              <span className="text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center">
                <Info size={14} className="mr-1" />
                Market News
              </span>
            </Link>
            <a 
              href="mailto:contact@socialbrands.ai" 
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center"
            >
              <HeartHandshake size={14} className="mr-1" />
              Contact Us
            </a>
          </div>
          
          {/* Legal section with coming soon dialogs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button 
              onClick={() => handleLegalLink('Privacy Policy')}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center"
            >
              <ShieldCheck size={14} className="mr-1" />
              Privacy
            </button>
            <button 
              onClick={() => handleLegalLink('Terms of Service')}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center"
            >
              <BookText size={14} className="mr-1" />
              Terms
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                  <LockKeyhole size={14} />
                  <span>Admin</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Admin Access</DialogTitle>
                  <DialogDescription>
                    Access the admin panel to manage system settings and view project development status.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col space-y-4">
                    <Button asChild>
                      <Link href="/admin/panel">
                        <div className="flex items-center gap-2">
                          <LockKeyhole size={16} />
                          <span>Admin Panel</span>
                          <ExternalLink size={14} className="ml-auto opacity-70" />
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admin/system-check">
                        <div className="flex items-center gap-2">
                          <span>System Check</span>
                          <ExternalLink size={14} className="ml-auto opacity-70" />
                        </div>
                      </Link>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Legal Content Dialog */}
      <Dialog open={showLegalDialog} onOpenChange={setShowLegalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-500" />
              {legalContent.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{legalContent.content}</p>
            <div className="flex justify-between items-center mt-6 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-yellow-500 mt-0.5" />
                <p className="text-sm">These documents will be finalized before the official launch of CryptoBot.</p>
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

export default Footer;