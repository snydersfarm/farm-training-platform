/**
 * A simple utility function to conditionally join class names together
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
} 