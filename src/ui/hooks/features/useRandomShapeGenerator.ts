import { useCallback, useState } from 'react';
import { useFigmaPlugin } from '../core/useFigmaPlugin';

interface UseRandomShapeGeneratorReturn {
  readonly createdCount: number;
  readonly createRandomShape: () => void;
  readonly resetCount: () => void;
}

/**
 * Random Shape Generator Feature Hook
 *
 * This hook encapsulates the business logic for generating random shapes.
 * It builds upon the core useFigmaPlugin hook for communication.
 *
 * This is an example of how feature-specific hooks should be structured:
 * - Use core hook for basic communication
 * - Maintain feature-specific state
 * - Provide clean interface for components
 */
export function useRandomShapeGenerator(): UseRandomShapeGeneratorReturn {
  const { sendMessage } = useFigmaPlugin();
  const [createdCount, setCreatedCount] = useState<number>(0);

  const createRandomShape = useCallback((): void => {
    try {
      sendMessage({ type: 'create-random-shape' });
      setCreatedCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to create random shape:', error);
      // Don't increment count on error
    }
  }, [sendMessage]);

  const resetCount = useCallback((): void => {
    setCreatedCount(0);
  }, []);

  return {
    createdCount,
    createRandomShape,
    resetCount,
  };
}

export default useRandomShapeGenerator;
