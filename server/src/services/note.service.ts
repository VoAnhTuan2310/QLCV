import { prisma } from '../configs/prisma';
import { ApiError } from '../utils/apiError';
import { CreateNoteInput, UpdateNoteInput } from '../models/note.model';

/**
 * Get all active notes for a user
 */
export const getUserNotes = async (userId: string) => {
  return prisma.note.findMany({
    where: {
      userId,
      deletedAt: null, // Soft delete filter
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get note by ID
 */
export const getNoteById = async (noteId: string, userId: string) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
      deletedAt: null,
    },
  });

  if (!note) {
    throw new ApiError(404, 'Note not found or access denied');
  }

  return note;
};

/**
 * Create a new note
 */
export const createNote = async (userId: string, input: CreateNoteInput) => {
  return prisma.note.create({
    data: {
      ...input,
      userId,
    },
  });
};

/**
 * Update note by ID
 */
export const updateNoteById = async (noteId: string, userId: string, input: UpdateNoteInput) => {
  await getNoteById(noteId, userId);

  await prisma.note.updateMany({
    where: {
      id: noteId,
      userId,
      deletedAt: null,
    },
    data: input,
  });

  return getNoteById(noteId, userId);
};

/**
 * Soft delete note (sets deletedAt = new Date())
 */
export const softDeleteNoteById = async (noteId: string, userId: string) => {
  await getNoteById(noteId, userId);

  const result = await prisma.note.updateMany({
    where: {
      id: noteId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new ApiError(400, 'Failed to delete note');
  }

  return { id: noteId, message: 'Note deleted successfully' };
};
