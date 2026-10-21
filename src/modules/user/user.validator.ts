import Joi from 'joi';

export const UserValidator = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone must be a valid 10-digit number',
        'any.required': 'Phone is required',
      }),
    role: Joi.string().valid('ADMIN', 'USER', 'MANAGER').default('USER'),
    password: Joi.string().min(6).optional(),
  }).options({ abortEarly: false, stripUnknown: true }),

  update: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone must be a valid 10-digit number',
      }),
    role: Joi.string().valid('ADMIN', 'USER', 'MANAGER').optional(),
    password: Joi.string().min(6).optional(),
  }).options({ abortEarly: false, stripUnknown: true }),
};
