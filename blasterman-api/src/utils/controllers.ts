import express from 'express';
import {ObjectDto, rooms} from '../server'; 
import {idGenerator} from './engines';

const router = express.Router();

router.get('/connect-server', async (req: express.Request,
                                     res: express.Response) => {
                                         
  const dto: ObjectDto<string> = {data: idGenerator()};
  res.send(dto);
});

router.get('/rooms-list', async (req: express.Request,
                                 res: express.Response) => {
  const roomsIds = Array.from(rooms.keys()); 
  
  const dto: ObjectDto<string[]> = {info: 'roomsIds', data: roomsIds};

  res.send(dto);
  
});

export default router;


