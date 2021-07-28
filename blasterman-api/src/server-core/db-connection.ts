import mongoose from 'mongoose';
import BfModel from './db-model';
import { battleFieldMap } from '../utils/engines';

mongoose.connect('mongodb://localhost/blasterman', { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'connection error:'));

dbConnection.once('connected', async () => {
	console.log('conectou');
	await BfModel.deleteMany({});
	await BfModel.create(battleFieldMap);
	console.log('base pronta');
});