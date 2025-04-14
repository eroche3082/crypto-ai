import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-5 border-b border-border">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="bg-muted/50 p-2 rounded-lg text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}