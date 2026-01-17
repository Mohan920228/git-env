import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 8080;

const clusterAddress = process.env.MONGODB_CLUSTER_ADDRESS;
const dbUser = process.env.MONGODB_USERNAME;
const dbPassword = process.env.MONGODB_PASSWORD;
const dbName = process.env.MONGODB_DB_NAME;

// Encode password to handle special characters like @
const encodedPassword = encodeURIComponent(dbPassword);

const uri = `mongodb+srv://${dbUser}:${encodedPassword}@${clusterAddress}/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function startServer() {
  try {
    console.log('Trying to connect to db...');
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    console.log('Connected successfully to server');

    // Start the Express server only after DB connects
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Connection failed:', error.message);
    await client.close();
    console.log('Connection closed.');
    process.exit(1); // Stop app if DB fails
  }
}

startServer();

// Example route
app.get('/', (req, res) => {
  res.send('Hello, MongoDB!');
});

// Export the database client for other modules
export const database = client.db(dbName);
