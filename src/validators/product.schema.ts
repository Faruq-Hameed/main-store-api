import { IProduct } from "@/models/Product";
import Joi, { ValidationResult } from "joi";
import mongoose from "mongoose";

// Custom Joi extension for validating MongoDB ObjectId
const joiObjectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
}, 'ObjectId validation');

/**Product validator can handle validation for either a single product or an array of products */
//Also all fields except price fields are optional for update operation
export const productValidator = (data: Partial<IProduct>[] | Partial<IProduct>, isUpdate: boolean): ValidationResult => {
    const baseProductSchema =
        Joi.object({
            name: isUpdate? Joi.string(): Joi.string().trim().required().min(2).max(100)
                .messages({
                    'string.base': 'Name must be a string',
                    'string.empty': 'Name is required',
                    'string.min': 'Name must be at least 2 characters long',
                    'string.max': 'Name cannot exceed 100 characters',
                    'any.required': 'Name is required'
                }),

            description: isUpdate? Joi.string(): Joi.string().trim().required().min(10)
                .messages({
                    'string.base': 'Description must be a string',
                    'string.empty': 'Description is required',
                    'string.min': 'Description must be at least 10 characters long',
                    'any.required': 'Description is required'
                }),

            price: Joi.number().required().min(0)
                .messages({
                    'number.base': 'Price must be a number',
                    'number.min': 'Price cannot be negative',
                    'any.required': 'Price is required'
                }),

            category: isUpdate? Joi.string(): Joi.string().trim().required()
                .messages({
                    'string.base': 'Category must be a string',
                    'string.empty': 'Category is required',
                    'any.required': 'Category is required'
                }),

            availableQuantity: isUpdate? Joi.string() : Joi.number().integer().required().min(0)
                .messages({
                    'number.base': 'Available quantity must be a number',
                    'number.integer': 'Available quantity must be an integer',
                    'number.min': 'Available quantity cannot be negative',
                    'any.required': 'Available quantity is required'
                }),

            imageUrl: isUpdate? Joi.string(): Joi.string().uri().allow('').optional()
                .messages({
                    'string.base': 'Image URL must be a string',
                    'string.uri': 'Image URL must be a valid URL'
                }),



        })
    //create req body must be array of product objects
    const createProductSchema = Joi.array().items(baseProductSchema).min(1).required().messages({
        'array.base': 'Products must be an array',
        'array.min': 'At least one product is required',
        'any.required': 'Products are required'
    });

    // For update, expect a single product (not an array)
    const updateProductSchema = baseProductSchema.required().messages({
        'any.required': 'Product is required'
    });

    // Choose schema based on whether this is an update or creation
    if (isUpdate) {
        return updateProductSchema.validate(data, {
            abortEarly: false,
            errors: { wrap: { label: '' } },
        });
    } else {
        return createProductSchema.validate(data, {
            abortEarly: false,
            errors: { wrap: { label: '' } },
        });
    }
};
