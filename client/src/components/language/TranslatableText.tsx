import React from 'react';

interface TranslatableTextProps {
  text: string;
  spanish?: string;
  french?: string;
  portuguese?: string;
  language?: string;
}

export function TranslatableText({
  text,
  spanish,
  french,
  portuguese,
  language = 'en'
}: TranslatableTextProps) {
  switch (language) {
    case 'es':
      return <>{spanish || text}</>;
    case 'fr':
      return <>{french || text}</>;
    case 'pt':
      return <>{portuguese || text}</>;
    case 'en':
    default:
      return <>{text}</>;
  }
}