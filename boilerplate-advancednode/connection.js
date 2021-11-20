// Do not change this file
require('dotenv').config();
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const MONGO_URI ='mongodb+srv://@cluster0.yi6md.mongodb.net/advancednode'
const mySecret = process.env['SESSION_SECRET']
mongoose.connect(MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });


async function main(callback) {
     // Declare MONGO_URI in your .env file
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await callback(client);

    } catch (e) {
        // Catch any errors
        console.error(e);
        throw new Error('Unable to Connect to Database')
    }
}
console.log(mongoose.connection.readyState);

module.exports = main;