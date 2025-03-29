import Joi from 'joi';

import 'dotenv/config';
import { IConfig } from '../utils/types/config';

/**Env variables validator to ensure that all variables are available before starting the app */
const envValidation = Joi.object()
  .keys({
    PORT: Joi.number().required().default(3000),
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required(),

    MONGODB_URI: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
    JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
    JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN: Joi.string().required(),

    LOG_FOLDER: Joi.string().required(),
    LOG_FILE: Joi.string().required(),
    LOG_LEVEL: Joi.string().required(),


    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    S3_BUCKET_NAME: Joi.string().required(),

  })
  .unknown();

const { value: envVar, error } = envValidation
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(
    `Cannot Start Server:- Config Validation Error: ${error.message}`,
  );
}

export const config: IConfig = {
  logConfig: {
    logFolder: envVar.LOG_FOLDER,
    logFile: envVar.LOG_FILE,
    logLevel: envVar.LOG_LEVEL,
  },
  jwt: {
    secret: envVar.JWT_SECRET,
    accessTokenExpiry: envVar.JWT_EXPIRES,
    refreshTokenSecret: envVar.JWT_REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: envVar.JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN,
  },

  aws: {
    keyId: envVar.AWS_ACCESS_KEY_ID,
    secret: envVar.AWS_SECRET_ACCESS_KEY,
    region: envVar.AWS_REGION,
    bucket: envVar.S3_BUCKET_NAME,
  },

  cloudinary: {
    cloud_name: envVar.CLOUDINARY_CLOUD_NAME,
    api_key: envVar.CLOUDINARY_API,
    api_secret: envVar.CLOUDINARY_SECRET,
  },
  database: {
    db_uri: envVar.DB_HOST,
  },
};
