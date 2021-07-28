import express from 'express';
import { BattlefieldMap, Entity } from '../game/entities';
import {ObjectDto, rooms} from '../server'; 
import {idGenerator} from '../utils/engines';
import BfModel from './db-model';

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

router.get('/map/:id', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {
  const id = req.params.id;
  if (id) {
    const map = await BfModel.findById(id);
    if(map) {
      res.send({ info: map._id, data: map });
    }
  }
});

router.get('/get-maps', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap[]>>) => {
  const maps = await BfModel.find();
  res.send({data:maps});
});

router.delete('/:id', async (req: express.Request,
  res: express.Response<ObjectDto<unknown>>) => {

  const id = req.params.id;

  if(id) {
    const map = await BfModel.findById(id);
    if(map){
      map.remove();
      res.send({ info: 'deletado' });
    }
  }
});

router.post('/update/:id', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {
  const id = req.params.id;
  const updatedMap = req.body;
  const map = await BfModel.findByIdAndUpdate(id, updatedMap, { new: true });
  if(map) {
    res.send({ info: map._id, data: map });
  } else {
    res.send({info: 'erro ao atualizar'});
  }
});

router.post('/new-map', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {

  const { tiles, breakableBlocks, background } = req.body;
  const map = await BfModel.create({ tiles, breakableBlocks, background });

  res.send({ info: map._id, data: map });
});

export default router;