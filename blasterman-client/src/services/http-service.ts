import axios from  'axios';
import {API_URL} from '../utils/engines';


export class ConnectionService {
	private conn = axios;
	private static readonly _instace = new ConnectionService();

	static get instance(): ConnectionService {
		return this._instace;
	}	

	getRoomList(): Promise<{roomId: number, numPlayers: number}[]> {
		return this.conn.get(`${API_URL}/rooms-list`);
	}

}


