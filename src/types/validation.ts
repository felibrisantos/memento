import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const notesSchema = z.string().max(2000, 'Notes must be under 2000 characters');
export const ratingSchema = z.number().min(1).max(5).nullable();
export const statusSchema = z.enum(['completed', 'in_progress', 'planned', 'dropped']);
export const categorySchema = z.enum(['movies', 'tvshows', 'albums', 'books']);
