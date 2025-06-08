import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

const createOrderRules = () => [
  body('shippingInfo.name').notEmpty().withMessage('Name is required'),
  body('shippingInfo.email').isEmail().withMessage('Valid email is required'),
  body('shippingInfo.phone').notEmpty().withMessage('Phone is required'),
  body('shippingInfo.address').notEmpty().withMessage('Address is required'),
  body('shippingInfo.city').notEmpty().withMessage('City is required'),
  body('shippingInfo.zip').notEmpty().withMessage('ZIP code is required'),
  body('shippingInfo.country').notEmpty().withMessage('Country is required'),

  // Allow multiple payment methods
  body('paymentMethod')
    .isIn(['e-money', 'cash', 'paypal', 'momo', 'credit_card', 'card'])
    .withMessage('Invalid payment method'),

  // Optional e-money number if paymentMethod === 'e-money'
  body('eMoneyNumber')
    .if(body('paymentMethod').equals('e-money'))
    .notEmpty()
    .withMessage('e-Money number is required for e-money payments'),
];

const validate = (method) => {
  let rules;
  switch (method) {
    case 'createOrder':
      rules = createOrderRules();
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
