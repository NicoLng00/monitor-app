export const config = {
    mongo: {
      uri: process.env.MONGO_URI,
      dbName: process.env.MONGO_DB,
    },
    monitoring: {
      pollInterval: 2000,
      minDuration: 50
    }
  };