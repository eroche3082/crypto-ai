import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { LockKeyhole, Github, Twitter, ExternalLink } from "lucide-react";

export function Footer() {
  const [showQuickLinks, setShowQuickLinks] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-3 bg-card/40">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground">
            © {currentYear} CryptoBot AI. All rights reserved.
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter size={16} />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/privacy">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              Privacy
            </span>
          </Link>
          <Link href="/terms">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              Terms
            </span>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
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
    </footer>
  );
}

export default Footer;