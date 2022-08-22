import React, { FunctionComponent, useEffect } from 'react';
import LazyLoaded from '../src/components/LazyLoaded';

export default {
  title: 'Examples',
};

const LazyComponent: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    console.log('Loaded!');

    return () => {
      console.log('Unmouted');
    };
  }, []);

  return (
    <>
      <h1>I&apos;m lazy component</h1>
      {children}
    </>
  );
};

export const Basic = () => {
  return (
    <>
      <div style={{ height: '200vh' }}>Open console in Dev Tools and scroll down &#8964;</div>
      <LazyLoaded>
        <LazyComponent />
      </LazyLoaded>
    </>
  );
};

export const UnmountOnLeave = () => {
  return (
    <>
      <div style={{ height: '200vh' }}>Open console in Dev Tools and scroll down &#8964;</div>
      <LazyLoaded unmountOnLeave showWrapper height={76} placeholder="TEST">
        <LazyComponent>
          And now scroll up and watch console!
        </LazyComponent>
      </LazyLoaded>
    </>
  );
};
