import React, { FunctionComponent, HTMLAttributes, SyntheticEvent, useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LazyLoaded from './LazyLoaded';
import { act } from 'react-dom/test-utils';

const mockObserve = jest.fn();
const mockUnobserve = jest.fn();

const mockIntersectionObserver = jest.fn().mockReturnValue({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: jest.fn(),
});

class PromiseWithResolveAndReject<T> {
  public promise: Promise<T>;

  public resolve!: ((value: T | PromiseLike<T>) => void);

  public reject!: (() => void);

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

describe('LazyLoaded', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: mockIntersectionObserver,
    });
  });

  describe('Non-intersecting element', () => {
    it('should render placeholder instead of children', () => {
      render(<LazyLoaded placeholder={<>Loading...</>}>Children</LazyLoaded>);

      expect(screen.queryByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Children')).not.toBeInTheDocument();
      expect(mockObserve).toHaveBeenCalled();

    });
  });

  describe('Intersecting element', () => {
    it('should render children when intersects viewport', () => {
      render(<LazyLoaded placeholder={<>Loading...</>}>Children</LazyLoaded>);

      expect(screen.queryByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Children')).not.toBeInTheDocument();

      const mockObserveEl = mockObserve.mock.calls[0][0];
      const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

      act(() => {
        mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText('Children')).toBeInTheDocument();
    });

    it('should render without wrapper', () => {
      render(<LazyLoaded showWrapper={false}>Children</LazyLoaded>);

      const mockObserveEl = mockObserve.mock.calls[0][0];
      const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

      act(() => {
        mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
      });

      expect(screen.getByText('Children').parentElement?.tagName).toBe('BODY');
    });

    it('should render with wrapper', () => {
      render(<LazyLoaded showWrapper>Children</LazyLoaded>);

      const mockObserveEl = mockObserve.mock.calls[0][0];
      const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

      act(() => {
        mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
      });

      expect(screen.getByText('Children').parentElement?.parentElement?.tagName).toBe('BODY');
    });

    it('should render with width', () => {
      render(
        <LazyLoaded width="10%" placeholder={<>Placeholder</>}>
          Children
        </LazyLoaded>
      );

      expect(screen.getByText('Placeholder')).toHaveAttribute('style', 'width: 10%;');
    });

    it('should render with height', () => {
      render(
        <LazyLoaded height="10%" placeholder={<>Placeholder</>}>
          Children
        </LazyLoaded>
      );

      expect(screen.getByText('Placeholder')).toHaveAttribute('style', 'height: 10%;');
    });

    describe('Unmounting on leave viewport', () => {
      it('should unmount string component', async () => {
        render(
          <LazyLoaded unmountOnLeave placeholder={<>Placeholder</>}>
            Children
          </LazyLoaded>
        );

        const mockObserveEl = mockObserve.mock.calls[0][0];
        const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

        act(() => {
          mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
        });

        await waitFor(() => expect(screen.queryByText('Children')).toBeInTheDocument());
        expect(screen.getByText('Children').parentElement?.parentElement?.tagName).toBe('BODY');
        expect(screen.queryByText('Placeholder')).not.toBeInTheDocument();

        const mockObserveSecondEl = mockObserve.mock.calls[1][0];

        act(() => {
          mockIntersectionObserverCallback([
            { target: mockObserveSecondEl, isIntersecting: false },
          ]);
        });

        await waitFor(() => expect(screen.queryByText('Children')).not.toBeInTheDocument());
        expect(screen.queryByText('Placeholder')).toBeInTheDocument();
      });

      it('should unmount component on leave viewport', async () => {
        render(
          <LazyLoaded unmountOnLeave placeholder={<>Placeholder</>}>
            <span>Children</span>
          </LazyLoaded>
        );

        const mockObserveEl = mockObserve.mock.calls[0][0];
        const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

        act(() => {
          mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
        });

        await waitFor(() => expect(screen.queryByText('Children')).toBeInTheDocument());
        expect(screen.getByText('Children').parentElement?.parentElement?.tagName).toBe('BODY');
        expect(screen.queryByText('Placeholder')).not.toBeInTheDocument();

        const mockObserveSecondEl = mockObserve.mock.calls[1][0];

        act(() => {
          mockIntersectionObserverCallback([
            { target: mockObserveSecondEl, isIntersecting: false },
          ]);
        });

        await waitFor(() => expect(screen.queryByText('Children')).not.toBeInTheDocument());
        expect(screen.queryByText('Placeholder')).toBeInTheDocument();
      });
    });
  });

  describe('On load', () => {
    it('should call onLoad when element is intersecting', () => {
      const mockOnLoad = jest.fn();

      render(
        <LazyLoaded onLoad={mockOnLoad} placeholder={<>Placeholder</>}>
            Children
        </LazyLoaded>
      );

      const mockObserveEl = mockObserve.mock.calls[0][0];
      const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

      act(() => {
        mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
      });

      expect(mockOnLoad).toHaveBeenCalled();
    });

    it('should call onLoad when intersecting element is loaded', async () => {
      const mockOnLoad = jest.fn();
      const { promise, resolve } = new PromiseWithResolveAndReject<void>();

      const ComponentWithOnLoad: FunctionComponent<HTMLAttributes<HTMLElement>> = ({ onLoad }) => {
        useEffect(() => {
          promise.then(() => {
            onLoad?.({} as SyntheticEvent<HTMLElement>);
          });
        }, []);

        return <>Children</>;
      };

      render(
        <LazyLoaded onLoad={mockOnLoad} waitForComponentLoad placeholder={<>Placeholder</>}>
          <ComponentWithOnLoad />
        </LazyLoaded>
      );

      const mockObserveEl = mockObserve.mock.calls[0][0];
      const mockIntersectionObserverCallback = mockIntersectionObserver.mock.calls[0][0];

      act(() => {
        mockIntersectionObserverCallback([{ target: mockObserveEl, isIntersecting: true }]);
      });

      expect(mockOnLoad).not.toHaveBeenCalled();
      expect(screen.queryByText('Placeholder')).toBeInTheDocument();
      expect(screen.queryByText('Children')).toBeInTheDocument();

      act(() => {
        resolve();
      });

      await waitFor(() => expect(mockOnLoad).toHaveBeenCalled());
      expect(screen.queryByText('Placeholder')).not.toBeInTheDocument();
      expect(screen.queryByText('Children')).toBeInTheDocument();
    });
  });
});
