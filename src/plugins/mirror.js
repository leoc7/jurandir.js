import Plugin from './base';
import Logger from '../logger';
import fs from 'fs';
import Jimp from 'jimp';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

export default class MirrorPlugin extends Plugin {
    constructor() {
        super({
            name: 'Mirror',
            key: 'mirror',
            description: 'Espelha as imagens',
        });

        this.on('message', message => this.processMessage(message));
        this.enabled = true;
    }

    isImage(name) {
        return IMAGE_EXTENSIONS.some(extension => name.endsWith(extension));
    }

    mirrorImage({ name, url }, side) {
        return new Promise((resolve, reject) => {
            Jimp.read(url)
                .then(image => {
                    if (side == 'left') {
                        const xMid = image.getWidth() / 2;
                        const left = image
                            .clone()
                            .crop(0, 0, xMid, image.getHeight())
                            .flip(true, false);
                        image.blit(left, xMid, 0);
                        image.fisheye({r: 2})
                    }

                    if (side == 'right') {
                        const xMid = image.getWidth() / 2;
                        const right = image
                            .clone()
                            .crop(xMid - 1, 0, xMid, image.getHeight())
                            .flip(true, false);
                        image.blit(right, 0, 0);
                        image.fisheye({r: 2})
                    }

                    image.write(name, () => {
                        resolve(name);
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    processMessage(message) {
        if (message.attachments.size > 0) {
            const image = message.attachments.array()[0];

            let side = Math.random() > 0.5 ? 'left' : 'right';

            if (message.content == 'left' || message.content == 'right') {
                side = message.content;
            }

            if (this.isImage(image.name)) {
                this.mirrorImage(image, side)
                    .then(async imageFile => {
                        await message.channel.send('', {
                            files: [imageFile],
                        });
                    })
                    .catch(err => {
                        Logger.danger('Ocorreu um erro ao ler a imagem:', { time: true });
                        Logger.log(err);
                    })
                    .finally(() => {
                        fs.unlinkSync(image.name);
                    });
            }
        }
    }
}
