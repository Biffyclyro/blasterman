import axios from  'axios';
import { ObjectDto } from '../entities';
import {API_URL} from '../utils/engines';


export default class ConnectionService {
	private conn = axios;
	private static readonly INSTANCE = new ConnectionService();

	constructor() {
		if (ConnectionService.INSTANCE) {
			return ConnectionService.INSTANCE; 
		}
	}

	getRoomList(): Promise<ObjectDto<{roomId: string, numPlayers: number}[]>> {
		return this.conn.get(`${API_URL}/rooms-list`).then(r => r.data);
	}
}