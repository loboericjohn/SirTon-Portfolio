'use client';

import { useEffect, useState } from 'react';

export default function MouseFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      // Follower has a slight delay handled by CSS transition
      setFollowerPosition({ x: e.clientX - 15, y: e.clientY - 15 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div 
        className="cursor" 
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      />
      <div 
        className="cursor-follower" 
        style={{ transform: `translate3d(${followerPosition.x}px, ${followerPosition.y}px, 0)` }}
      />
    </>
  );
}
