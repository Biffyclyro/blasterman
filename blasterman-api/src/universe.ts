export class Physics {
  private periodicFunctions: Action[]
  private readonly TICK_RATE: number = 16.6;
  private loop: ReturnType<typeof setTimeout>; 


  constructor(...p: Action[]) { 
    this.periodicFunctions = p;
    this.loop = setInterval(this.updateWorld, this.TICK_RATE);
  }


  updateWorld(): void {
    this.periodicFunctions.forEach( f => f());   
  }

  destroyInterval(): void {
    clearInterval(this.loop);
  }

}

export interface Action{
  (): Promise<void>;
}

