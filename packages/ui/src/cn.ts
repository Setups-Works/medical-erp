import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names; later Tailwind classes win (so callers can override). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
