export const config = {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGO_DB || 'monitoring',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    monitoring: {
      pollInterval: 2000,
      minDuration: 50
    }
  };