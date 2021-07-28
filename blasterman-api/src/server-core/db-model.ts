import mongoose from "mongoose";
import { BattlefieldMap } from "../game/entities";

const battleFieldMap = new mongoose.Schema<BattlefieldMap>({
	tiles: String,
  breakableBlocks: [{ x: Number, y: Number }],
  background: { key: String, url: String }
});

const BfModel = mongoose.model<BattlefieldMap>('BattlefieldMap', battleFieldMap);

export default BfModel;