'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

export default function Home() {
  console.log('Home component rendered!');

  useEffect(() => {
    console.log('Home component mounted!');
    return () => {
      console.log('Home component UNMOUNTED!');
    };
  }, []);

  return (
    <main>
      <MapComponent key="main-map" />
    </main>
  );
}
