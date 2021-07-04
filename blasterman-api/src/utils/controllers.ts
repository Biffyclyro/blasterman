import express from 'express';
import { Entity } from '../entities';
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

  const activeRooms = Array.from(rooms.values()).map(r => {
    return r.statusInfo;
  });

  res.send({data: activeRooms});
});

router.get('/rooms-debug', async (req: express.Request,
                                 res: express.Response) => {
  const roomsMap = Array.from(rooms.values()); 

  const mapas: {campo:Entity[]}[] =[];   

  roomsMap.forEach(bbb => mapas.push({campo: bbb.getCampo()}));

  const dto = mapas;

  res.send(dto);
  
});

export default router;


