import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().default(''),
    color: z.string().optional().default('#ffffff'),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Note ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().optional(),
    color: z.string().optional(),
  }),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>['body'];
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>['body'];
