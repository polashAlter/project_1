import { z } from 'zod';

const createSpecialty = z.object({
  title: z.string({
    required_error: 'Title is required',
  }),
});



export const SpecialtyValidation = {
  createSpecialty
};
