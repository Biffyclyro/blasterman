/* eslint-disable no-irregular-whitespace */
import express from 'express';
import {BfModel, UserModel} from './db-model';
import { ObjectDto, rooms } from '../server';
import { encrypter, idGenerator, tokenExtractor } from '../utils/engines';
import { BattlefieldMap, Entity } from '../game/entities';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

//get random config
export const getMap = async (): Promise<BattlefieldMap | null> => {
  const mapsList = await BfModel.find();
  const index = Math.floor(Math.random() * mapsList.length);
  return mapsList[index];
}

export const saveUser = async ({email, password}:{email:string, password: string}): Promise<void> => {
  await encrypter(password).then(async pw => {
    await UserModel.create({ email: email, password: pw });
  });
}

const verifyUser = async (token: string): Promise<boolean> => {
  return await UserModel.find().then((u: { _id: string; email: string; password: string; }[]) => {
    const user = u.pop();
    const key = user?.password;
    if (key) {
      const possibleUser: jwt.JwtPayload | string = jwt.verify(token, key);
      if (typeof possibleUser !== 'string' && possibleUser.password === key) {
        return true;
      }
    }
    return false;
  });
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
                               
  await UserModel.find().then((u: { _id: string, email: string, password: string }[]) => {
    const user = u.pop(); 
    const dbHash = user?.password;
    const reqPassword = req.body.data.password;
    const reqEmail = req.body.data.email;
    const dbEmail = user?.email;

    if (reqEmail === dbEmail) {
      if (reqPassword && dbHash && bcrypt.compareSync(reqPassword, dbHash)) {
        res.send({ data: jwt.sign(req.body.data, dbHash) });
      } else {
        res.send('credenciais incorretas!');
      }
    }
  });
});

// get one map
router.get('/map/:id', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {
  const id = req.params.id;
  const token = tokenExtractor(req); 
  if (id && token && verifyUser(token)) {
    const map = await BfModel.findById(id);
    if (map) {
      res.send({ info: map._id, data: map });
    }
  }
});
//get all maps
router.get('/get-maps', async (req: express.Request,
  res: express.Response<ObjectDto<BattlefieldMap[]>>) => {

  const token = tokenExtractor(req);
  if (token && verifyUser(token)) {
    const maps = await BfModel.find();
    res.send({ data: maps });
  }
});
//delete map
router.delete('/:id', async (req: express.Request,
  res: express.Response<ObjectDto<unknown>>) => {

  const id = req.params.id;
  const token = tokenExtractor(req);
  if (id && token && verifyUser(token)) {
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
  const token = tokenExtractor(req);
  if (token && verifyUser(token)) {
    const map = await BfModel.findByIdAndUpdate(id, updatedMap, { new: true });
    if (map) {
      res.send({ info: map._id, data: map });
    } else {
      res.send({ info: 'erro ao atualizar' });
    }
  }
});
//create new map
router.post('/new-map', async (req: express.Request<ObjectDto<BattlefieldMap>>,
  res: express.Response<ObjectDto<BattlefieldMap>>) => {
  const token = tokenExtractor(req);
  
  if (token && verifyUser(token)) {
    const map = await BfModel.create(req.body.data);

    res.send({ info: map._id, data: map });
  }
});

export default router;