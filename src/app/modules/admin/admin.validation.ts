import { z } from "zod";

const updateAdmin = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().optional(),
});

export const AdminValidation = {
  updateAdmin,
};
