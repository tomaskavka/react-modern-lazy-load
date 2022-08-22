import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import useIntersectionObserver, {
  IntersectionObserverOptionsType,
} from 'react-simple-use-intersection-observer';
import addPropsToChildren from '../utils/addPropsToChildren';
import callAll from '../utils/callAll';

export type LazyLoadedProps = {
  placeholder?: React.ReactNode;
  observerOptions?: Omit<IntersectionObserverOptionsType, 'keepTracking'>;
  width?: string | number;
  height?: string | number;
  showWrapper?: boolean;
  unmountOnLeave?: boolean;
  waitForComponentLoad?: boolean;
  onLoad?: () => void;
  children: React.ReactNode;
};

const LazyLoaded: FunctionComponent<LazyLoadedProps> = ({
  placeholder,
  observerOptions,
  width,
  height,
  showWrapper = false,
  unmountOnLeave = false,
  waitForComponentLoad = false,
  onLoad,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setLoaded] = useState(false);
  const { isInViewport } = useIntersectionObserver(ref, {
    rootMargin: '100%',
    ...observerOptions,
    keepTracking: unmountOnLeave,
  });
  const handleComponentLoad = () => setLoaded(true);

  useEffect(() => {
    if (isInViewport && !waitForComponentLoad) {
      setLoaded(true);
    }
  }, [isInViewport]);

  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  if (!isInViewport) {
    return (
      <div ref={ref} style={{ width, height }}>
        {placeholder}
      </div>
    );
  }

  const isWaitingForComponentLoad = waitForComponentLoad && onLoad;
  const isWrapped =
    showWrapper ||
    isWaitingForComponentLoad ||
    (unmountOnLeave && typeof children === 'string') ||
    React.Children.count(children) > 1;

  if (!isWrapped) {
    if (!unmountOnLeave) {
      return <>{children}</>;
    }

    return <>{addPropsToChildren(children as React.ReactElement, {
      ref,
    })}</>;
  }

  const preparedChildren =
    isWaitingForComponentLoad
      ? addPropsToChildren(children as React.ReactElement, child => ({
        onLoad: callAll(handleComponentLoad, onLoad, child.props.onLoad),
      }))
      : children;

  return (
    <div ref={unmountOnLeave ? ref : null} style={{ paddingTop: 1, marginTop: -1 }}>
      {!isLoaded ? (
        <div style={{ width, height }}>
          {placeholder}
        </div>
      ) : null}
      {preparedChildren}
    </div>
  );
};

export default LazyLoaded;
