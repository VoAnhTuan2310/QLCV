import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/note.service';
import { ApiError } from '../utils/apiError';

export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const notes = await noteService.getUserNotes(req.user.id);
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const note = await noteService.getNoteById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const note = await noteService.createNote(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Note created successfully', data: note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const note = await noteService.updateNoteById(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Note updated successfully', data: note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const result = await noteService.softDeleteNoteById(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};
