import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

const registerRules = () => [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const loginRules = () => [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validate = (method) => {
  let rules;
  switch (method) {
    case 'register':
      rules = registerRules();
      break;
    case 'login':
      rules = loginRules();
      break;
    default:
      throw new ApiError(400, 'Invalid validation method');
  }

  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', errors.array());
      }
      next();
    },
  ];
};

export default validate;