import mongoose from 'mongoose';
import {BfModel, UserModel} from './db-model';
import { battleFieldMap } from '../utils/engines';
import { saveUser } from './controllers';

mongoose.connect('mongodb://localhost/blasterman', { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'connection error:'));

dbConnection.once('connected', async () => {
	console.log('conectou');
	await BfModel.deleteMany({});
	await BfModel.create(battleFieldMap);
	await UserModel.deleteMany({});
	//await UserModel.create({email:'teste', password:'teste'})
	await saveUser({email: 'teste', password: '1234'});
	const user = await UserModel.find();

	console.log(user, 'base pronta');
});
 