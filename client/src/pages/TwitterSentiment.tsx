import { TwitterFeed } from '@/components/twitter/TwitterFeed';

export default function TwitterSentiment() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <TwitterFeed />
    </div>
  );
}