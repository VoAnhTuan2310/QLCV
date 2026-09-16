import { Router } from 'express';
import { getNotes, getNoteById, createNote, updateNote, deleteNote } from '../../controllers/note.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createNoteSchema, updateNoteSchema } from '../../models/note.model';

const router = Router();

router.use(authenticate);

router.get('/', getNotes);
router.post('/', validate(createNoteSchema), createNote);
router.get('/:id', getNoteById);
router.put('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;
