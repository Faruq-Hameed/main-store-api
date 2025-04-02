import { IManager } from "@/models/Manager";
import Joi, { ValidationResult } from "joi";
import { Schema } from "mongoose";
import { ILogin } from "../types";

/** Manager validation with joi */
export const managerValidator = (
    manager: Partial<IManager>,
    isNew: boolean = true, // specifies whether data is a new or a updated data. All fields required for create optional for updates
): ValidationResult => {
    const managerValidationSchema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        password: Joi.string()
            .pattern(
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>/?]{8,}$/,
            )
            .required()
            .messages({
                'string.pattern.base':
                    'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.',
                'string.empty': 'Password cannot be empty.',
            }),
        email: Joi.string().email().required(),
        phonenumber: Joi.string().required()
    })
    return managerValidationSchema.validate(manager, {
        abortEarly: false, // Include all errors
        errors: { wrap: { label: '' } },
    });
};


export const loginValidator = (
    loginData: Partial<ILogin>,
): ValidationResult => {
    const loginDataValidationSchema = Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.base': 'Email must be a string',
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().required()
            .messages({
                'string.base': 'Password must be a string',
                'string.empty': 'Password is required',
                'any.required': 'Password is required'
            })
    });

    return loginDataValidationSchema.validate(loginData, {
        abortEarly: true, // Include all errors
        errors: { wrap: { label: '' } },
    });
};