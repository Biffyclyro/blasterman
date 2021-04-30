import {v4 as uuid} from 'uuid';

export function idGenerator(): string {
  return uuid(); 
}
