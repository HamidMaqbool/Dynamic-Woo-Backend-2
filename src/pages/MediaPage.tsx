
import React from 'react';
import { MediaManager } from '../components/media/MediaManager';

const MediaPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <MediaManager />
      </div>
    </div>
  );
};

export default MediaPage;
