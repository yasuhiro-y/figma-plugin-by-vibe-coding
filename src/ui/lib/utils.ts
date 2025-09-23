import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * This is the standard utility function used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
