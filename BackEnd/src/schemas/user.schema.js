const { z } = require('zod');

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
});

const baseUserSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-zA-Z\s\/]+$/, 'Name can only contain letters, spaces, and "/"'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
  phoneNumber: z.string().regex(/^09\d{8}$/, 'Phone number must start with 09 and be 10 digits'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  address: z.string().optional()
});

const studentRegisterSchema = baseUserSchema.extend({
  schoolName: z.string().optional(),
  educationLevel: z.string().min(1, 'Education level is required'),
  classLevel: z.string().optional(),
  isCurrentStudent: z.boolean().default(false),
  parentEmail: z.preprocess(val => val === '' ? undefined : val, z.string().email('Invalid parent email format').optional()),
  parentPhone: z.preprocess(val => val === '' ? undefined : val, z.string().regex(/^09\d{8}$/, 'Parent phone must start with 09 and be 10 digits').optional()),
  courseLevel: z.preprocess(val => val === '' || val === undefined ? 'beginner' : val, z.string().toLowerCase().pipe(z.enum(['beginner', 'intermediate', 'advanced'])))
}).refine(data => {
  if (data.isCurrentStudent && !data.parentEmail) return false;
  return true;
}, {
  message: "Parent email is required for current students",
  path: ["parentEmail"]
}).refine(data => {
  if (data.email && data.parentEmail && data.email.toLowerCase() === data.parentEmail.toLowerCase()) return false;
  return true;
}, {
  message: "Student and parent emails cannot be the same",
  path: ["parentEmail"]
});

const parentRegisterSchema = baseUserSchema.omit({ gender: true, address: true, username: true }).extend({
  username: z.preprocess(val => val === '' ? undefined : val, z.string().min(3, 'Username must be at least 3 characters').optional())
});

const adminRegisterSchema = baseUserSchema.omit({ gender: true, address: true, phoneNumber: true, username: true }).extend({
  username: z.preprocess(val => val === '' ? undefined : val, z.string().min(3, 'Username must be at least 3 characters').optional()),
  phoneNumber: z.preprocess(val => val === '' ? undefined : val, z.string().regex(/^09\d{8}$/, 'Phone number must start with 09 and be 10 digits').optional())
});

const teacherRegisterSchema = baseUserSchema.omit({ password: true, username: true }).extend({
  specialization: z.string().optional(),
  courseIds: z.array(z.number()).optional()
});

module.exports = {
  loginSchema,
  studentRegisterSchema,
  parentRegisterSchema,
  adminRegisterSchema,
  teacherRegisterSchema
};
