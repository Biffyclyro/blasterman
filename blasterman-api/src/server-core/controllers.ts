/* eslint-disable no-irregular-whitespace */
import express from 'express';
import BfModel from './db-model';
import { ObjectDto, rooms } from '../server';
import { idGenerator } from '../utils/engines';
import { BattlefieldMap, Entity } from '../game/entities';
import jwt from 'jsonwebtoken';

const router = express.Router();

//get random config
export const getMap = async (): Promise<BattlefieldMap | null> => {
  const mapsList = await BfModel.find();
  const index = Math.floor(Math.random() * mapsList.length);
  return mapsList[index];
}

router.get('/connect-server', async (req: express.Request,
  res: express.Response) => {

  const dto: ObjectDto<string> = { data: idGenerator() };
  res.send(dto);
});

router.get('/rooms-list', async (req: express.Request,
  res: express.Response) => {

  const activeRooms = Array.from(rooms.values()).map(r => {
    return r.statusInfo;
  });

  res.send({ data: activeRooms });
});

router.get('/rooms-debug', async (req: express.Request,
  res: express.Response) => {
  const roomsMap = Array.from(rooms.values());

  const mapas: { campo: Entity[] }[] = [];

  roomsMap.forEach(bbb => mapas.push({ campo: bbb.getCampo() }));

  const dto = mapas;

  res.send(dto);
});

//user login

router.post('/login', async (req: express.Request<ObjectDto<{email: string, password: string}>>,
                             res: express.Response) => {
  res.send( {data:jwt.sign(req.body.data, 'teste')});
});

// get one map
router.get('/map/:id', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {
  const id = req.params.id;
  if (id) {
    const map = await BfModel.findById(id);
    if (map) {
      res.send({ info: map._id, data: map });
    }
  }
});
//get all maps
router.get('/get-maps', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap[]>>) => {
  const maps = await BfModel.find();
  res.send({ data: maps });
});
//delete map
router.delete('/:id', async (req: express.Request,
  res: express.Response<ObjectDto<unknown>>) => {

  const id = req.params.id;

  if (id) {
    const map = await BfModel.findById(id);
    if (map) {
      map.remove();
      res.send({ info: 'deletado' });
    }
  }
});
//update map
router.post('/update/:id', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {
  const id = req.params.id;
  const updatedMap = req.body.data;
  const map = await BfModel.findByIdAndUpdate(id, updatedMap, { new: true });
  if (map) {
    res.send({ info: map._id, data: map });
  } else {
    res.send({ info: 'erro ao atualizar' });
  }
});
//create new map
router.post('/new-map', async (req: express.Request<ObjectDto<BattlefieldMap>>,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {

  console.log(req.body)
  const map = await BfModel.create(req.body.data);

  res.send({ info: map._id, data: map });
});

export default router;