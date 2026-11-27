/**
 * MENO staff sign-in (ADR-0020) and reference file loads (PLT-22, /platform/reference-data). Mirrors
 * PlatformLoginRequest and the multipart POST /api/v1/platform/reference-data/{code}/loads in meno-api.
 */
import { z } from "zod";
import { email } from "./fields";

export const platformLogin = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200, "Keep it under 200 characters."),
});
export type PlatformLoginForm = z.input<typeof platformLogin>;
export type PlatformLogin = z.infer<typeof platformLogin>;

/** The lists are CSV files as India Post and RBI publish them (saved as CSV); size is the server's upload limit. */
export const REFERENCE_FILE_MAX_BYTES = 100 * 1024 * 1024;

/** `today` (yyyy-MM-dd, India) bounds the file date: a publication date can't be in the future. */
export function referenceLoad({ today }: { today: string }) {
  return z.object({
    file: z
      .custom<File | null>((v) => v === null || (typeof File !== "undefined" && v instanceof File), "Choose a CSV file.")
      .refine((f): f is File => f !== null, "Choose a CSV file.")
      .refine((f) => f === null || /\.csv$/i.test(f.name), "Upload the list as a .csv file.")
      .refine((f) => f === null || f.size > 0, "The file is empty.")
      .refine((f) => f === null || f.size <= REFERENCE_FILE_MAX_BYTES, "The file is larger than 100 MB."),
    sourceDate: z
      .string()
      .min(1, "Enter the date the source published this file.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date.")
      .refine((d) => d <= today, "The file's date can't be in the future."),
    replaceAnyway: z.boolean(),
  });
}
export type ReferenceLoadForm = z.input<ReturnType<typeof referenceLoad>>;
export type ReferenceLoadValues = z.infer<ReturnType<typeof referenceLoad>>;
