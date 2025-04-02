export interface IConfig {
    logConfig: {
      logFolder: string;
      logFile: string;
      logLevel: string;
    };
    jwt: {
      secret: string;
      accessTokenExpiry: string;
      refreshTokenSecret: string;
      refreshTokenExpiry: string;
    };
    aws: {
      keyId: string;
      secret: string;
      region: string;
      bucket: string;
    };
    cloudinary: {
      cloud_name: string;
      api_key: string;
      api_secret: string;
    };
    database: {
      db_uri: string;
    };
    serverEnv: string
  }
  