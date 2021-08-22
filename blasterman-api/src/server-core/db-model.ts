import mongoose from "mongoose";
import { BattlefieldMap } from "../game/entities";

const battleFieldMapSchema = new mongoose.Schema<BattlefieldMap>({
	tiles: String,
  breakableBlocks: [{ x: Number, y: Number }],
  background: { key: String, url: String }
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

export const BfModel = mongoose.model<BattlefieldMap>('BattlefieldMap', battleFieldMapSchema);

export const UserModel = mongoose.model('User', userSchema);