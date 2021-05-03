import {v4 as uuid} from 'uuid';

export const idGenerator = (): string => {
  return uuid(); 
}
