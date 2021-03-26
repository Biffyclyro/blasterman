
export default class RoomManager {
  private players: Player[]; 
  private readonly TICK_RATE: number = 0.1;

  constructor() {
    this.tickTimer: number = 0.0;
  }

  public pushPlayers(p: Player): void {
    this.players.push(p); 
  }

  public tickeClientState(timeElapsed) {
    this.tickTimer += timeElapsed;

    if ( this.tickTimer < this.TICK_RATE) return;

    this.tickTimer = 0.0;

  }

  public updateEntities() {
    players.forEach(p => {

    });

  }




}

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

export interface Player {
  id: string;
  x, y: number;
  direction: Direction;
  move: boolean;
  alive: boolean;
}
