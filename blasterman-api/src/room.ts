
export default class RoomManager {
  private players: Map<string, Player>;
  private readonly TICK_RATE: number = 0.1;

  constructor() {
    this.tickTimer: number = 0.0;
  }

  public pushPlayers(p: Player): void {
    if (!players.has(p.playerId) {
      this.players.set(p.playerId, p); 
    }
  }

  public tickeClientState(timeElapsed) {
    this.tickTimer += timeElapsed;

    if ( this.tickTimer < this.TICK_RATE) return;

    this.tickTimer = 0.0;

  }

  public updatePos({playerId: string, move: Move}): void {
    switch(move.direction) {
      case 1:
        

    }

  }

  public addMove(playerId: string, move: Move) {
    if (this.players.has(playerId)) {
      p = this.players.get(playerId);
      p.moves.push(move);
    }
  }

  public updateEntities(): Map<string, Move> {
    const = playersMoves: Map<string, Move>;

    players.forEach( p => {
      const move = p.moves.pop();
      playersMoves.set(p.playerId, move);
    });

    return playersMoves;
        
  }
  public movePlayer(p: Player): void {
    
  }

  

}

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

export type Pos = [x: number, y: number];

export interface Move {
  timestamp: string;
  moving: boolean;
  direction: Direction;
}

export interface Status {
  pos: Pos;
  alive: boolean;
}

export interface Player {
  playerId: string;
  stats: Status;
  moves: Move[];
}
