import React from 'react';

interface TranslatableTextProps {
  text: string;
  spanish?: string;
  french?: string;
  portuguese?: string;
  language?: string;
  className?: string;
}

export const TranslatableText: React.FC<TranslatableTextProps> = ({
  text,
  spanish,
  french,
  portuguese,
  language = 'en',
  className
}) => {
  const getLocalizedText = () => {
    switch (language) {
      case 'es':
        return spanish || text;
      case 'fr':
        return french || text;
      case 'pt':
        return portuguese || text;
      default:
        return text;
    }
  };

  return <span className={className}>{getLocalizedText()}</span>;
};