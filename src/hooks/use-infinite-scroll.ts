'use client';

import { useRef, useCallback, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 0.1
}: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const loadingRef = useRef(false);
  const hasTriggeredRef = useRef(false);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading || !hasMore) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting;
        
        // Reset trigger flag when element is not intersecting (user scrolled away)
        if (!isIntersecting) {
          hasTriggeredRef.current = false;
        }
        
        // Only trigger if intersecting, has more data, not loading, not already triggered
        if (isIntersecting && hasMore && !loading && !loadingRef.current && !hasTriggeredRef.current) {
          loadingRef.current = true;
          hasTriggeredRef.current = true;
          onLoadMore();
        }
      },
      {
        rootMargin: '100px',
        threshold: threshold
      }
    );

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore, threshold]);

  // Reset loading ref when loading state changes
  useEffect(() => {
    if (!loading) {
      loadingRef.current = false;
    }
  }, [loading]);

  return { lastElementRef };
}
