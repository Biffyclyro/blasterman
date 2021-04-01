export class Physics {
  private periodicFunctions: Action[]
 constructor(...p: Action[]) { 
    this.periodicFunctions = p;
 }


  public updateWorld(): void {
    this.periodicFunctions.forEach( f => f());   
  }
    
}

export interface Action{
  (...args: any): Promise<void>;
}

