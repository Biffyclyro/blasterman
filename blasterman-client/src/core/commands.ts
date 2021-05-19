import {Player, Direction} from '../entities';

export interface Command {
    (p: Player):void;
}

export const dropBomb: Command = (p: Player) => {

    //solta a bomba e notifica o servidor do evento
    p.wsConnection.send('/app/bomb', {},
        JSON.stringify({
            playerId: p.playerId, x: p.x, y: p.y
        })
    );

    p.anims.play(`${p.skin}4`, true);

    p.setBomb();
}

export const moveLeft: Command = (p:Player) => {
    //flipa o sprite para aproveitar reciclar apenas um
    p.setFlipX(true);
    p.setVelocityX(-160);

    if (!p.moving || p.direction != Direction.left) {

        p.moving = true;
        p.direction = Direction.left;
        p.wsConnection.send('/app/test', {},
            JSON.stringify({
                playerId: p.playerId, direction: p.direction, moving: true,
                x: p.x, y: p.y
            })
        );
    }

    p.anims.play(`${p.skin}0`, true);
}

export const moveRight: Command = (p: Player) => {

        p.resetFlip();
        p.setVelocityX(+160);

        if (!p.moving || p.direction != Direction.right) {

            p.moving = true;
            p.direction = Direction.right;
            p.wsConnection.send('/app/test', {},
                JSON.stringify({
                    playerId: p.playerId, direction: p.direction, moving: p.moving,
                    x: p.x, y: p.y
                })
            );
        }

        p.anims.play(`${p.skin}0`, true);
}


export const moveUp: Command = (p: Player) => {
    p.setVelocityY(-160);

    if (!p.moving || p.direction != Direction.up) {

        p.moving = true;
        p.direction = Direction.up;
        p.wsConnection.send('/app/test', {},
            JSON.stringify({
                playerId: p.playerId, direction: p.direction, moving: p.moving,
                x: p.x, y: p.y
            })
        );
    }

    p.anims.play(`${p.skin}2`, true);
}

export const moveDown: Command = (p: Player) => {
    p.setVelocityY(+160);

    if (!p.moving || p.direction != Direction.down) {

        p.moving = true;
        p.direction = Direction.down;
        p.wsConnection.send('/app/test', {},
            JSON.stringify({
                playerId: p.playerId, direction: p.direction, moving: p.moving,
                x: p.x, y: p.y
            })
        );
    }

    p.anims.play(`${p.skin}3`, true);
}

export const stopMove: Command = (p: Player) => {

    p.setVelocity(0, 0);

    p.anims.play(`${p.skin}1`, true);

    if (p.moving) {

        p.moving = false;
        p.wsConnection.send('/app/test', {},
            JSON.stringify({
                playerId: p.playerId, direction: p.direction, moving: p.moving,
                x: p.x, y: p.y
            })
        );
    }
}
