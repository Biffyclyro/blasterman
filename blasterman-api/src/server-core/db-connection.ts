import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/blasterman', { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'connection error:'));