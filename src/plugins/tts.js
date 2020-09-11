import Plugin from './base';
import Logger from '../logger';
import axios from 'axios';
import googleTTS from 'google-tts-api';

export const VOICES = [
    {
        command: '-pt',
        id: 'Ricardo',
        description: 'Português masculino',
        engine: 'amazon',
    },
    {
        command: '-pt2',
        id: 'Vitoria',
        description: 'Português feminino',
        engine: 'amazon',
    },
    {
        command: '-pt3',
        id: 'pt',
        description: 'Português feminino 2',
        engine: 'google',
    },
    {
        command: '-dk',
        id: 'Naja',
        description: 'Dinamarquês feminino',
        engine: 'amazon',
    },
    {
        command: '-dk2',
        id: 'Mads',
        description: 'Dinamarquês masculino',
        engine: 'amazon',
    },
    {
        command: '-cn',
        id: 'Zhiyu',
        description: 'Chinês feminino',
        engine: 'amazon',
    },
    {
        command: '-fr',
        id: 'Lea',
        description: 'Francês feminino',
        engine: 'amazon',
    },
    {
        command: '-fr2',
        id: 'Mathieu',
        description: 'Francês masculino',
        engine: 'amazon',
    },
    {
        command: '-jp',
        id: 'Mizuki',
        description: 'Japonês feminino',
        engine: 'amazon',
    },
    {
        command: '-kr',
        id: 'Seoyeon',
        description: 'Coreano feminino',
        engine: 'amazon',
    },
    {
        command: '-jp2',
        id: 'Takumi',
        description: 'Japonês masculino',
        engine: 'amazon',
    },
    {
        command: '-en',
        id: 'Joanna',
        description: 'Inglês feminino',
        engine: 'amazon',
    },
    {
        command: '-en2',
        id: 'Matthew',
        description: 'Inglês masculino',
        engine: 'amazon',
    },
    {
        command: '-es',
        id: 'Penelope',
        description: 'Espanhol feminino',
        engine: 'amazon',
    },
    {
        command: '-es2',
        id: 'Miguel',
        description: 'Espanhol masculino',
        engine: 'amazon',
    },
    {
        command: '-es3',
        id: 'es',
        description: 'Espanhol feminino 2',
        engine: 'google',
    },
    {
        command: '-de',
        id: 'de',
        description: 'Alemão feminino',
        engine: 'google',
    },
    {
        command: '-gr',
        id: 'el',
        description: 'Grego feminino',
        engine: 'google',
    },
    {
        command: '-hu',
        id: 'hu',
        description: 'Húngaro feminino',
        engine: 'google',
    },
    {
        command: '-la',
        id: 'la',
        description: 'Latim masculino',
        engine: 'google',
    },
    {
        command: '-hi',
        id: 'hi',
        description: 'Hindi feminino',
        engine: 'google',
    },
    {
        command: '-ru',
        id: 'ru',
        description: 'Russo feminino',
        engine: 'google',
    },
    {
        command: '-ar',
        id: 'ar',
        description: 'Árabe feminino',
        engine: 'google',
    },
    {
        command: '-th',
        id: 'th',
        description: 'Tailandês feminino',
        engine: 'google',
    },
    {
        command: '-it',
        id: 'it',
        description: 'Italiano masculino',
        engine: 'google',
    },
    {
        command: '-eo',
        id: 'eo',
        description: 'Esperanto masculino',
        engine: 'google',
    },
    {
        command: '-fi',
        id: 'fi',
        description: 'Finlandês feminino',
        engine: 'google',
    },
    {
        command: '-su',
        id: 'su',
        description: 'Sundanês feminino',
        engine: 'google',
    },
    {
        command: '-sv',
        id: 'sv',
        description: 'Sueco feminino',
        engine: 'google',
    },
    {
        command: '-pl',
        id: 'pl',
        description: 'Polonês masculino',
        engine: 'google',
    },
    {
        command: '-no',
        id: 'no',
        description: 'Norueguês feminino',
        engine: 'google',
    },
    {
        command: '-tr',
        id: 'tr',
        description: 'Turco feminino',
        engine: 'google',
    }
];

export default class TTSPlugin extends Plugin {
    queue = [];
    isPlaying = false;
    broadcast = null;

    constructor() {
        super({
            name: 'TTS',
            key: 'tts',
            description: 'TTS melhor que o do discord disponível em vários línguas',
        });

        this.enabled = true;
        this.on('message', message => this.processMessage(message));
        this.tickQueue();
    }

    getAudio(voice, message) {
        return new Promise((resolve, reject) => {
            if (voice.engine == 'amazon') {
                axios
                    .post('https://streamlabs.com/polly/speak/', {
                        voice: voice.id,
                        text: message,
                    })
                    .then(res => {
                        resolve(res.data['speak_url']);
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
            if (voice.engine == 'google') {
                googleTTS(message, voice.id, 1)
                    .then(url => {
                        resolve(url);
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }

    playAudio({ audio, channel }) {
        return new Promise((resolve, reject) => {
            this.isPlaying = true;

            channel
                .join()
                .then(connection => {
                    this.broadcast = connection.play(audio);

                    this.broadcast.on('finish', () => {
                        resolve();
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    skipAudio() {
        this.broadcast.end();
        this.isPlaying = false;
        this.queue.shift();
    }

    processMessage(message) {
        if (message.content.startsWith('-tts skip')) {
            this.skipAudio();
            return;
        }

        for (let i = 0; i < VOICES.length; i++) {
            const voice = VOICES[i];

            if (message.content.startsWith(voice.command + ' ')) {
                const channel = message.member.voice.channel;
                if (!channel) return;

                this.getAudio(voice, message.content.replace(voice.command, '').trim())
                    .then(audio => {
                        Logger.log(`[${voice.id}] ${message.content}`, { time: true });
                        this.queue.push({ audio, channel });
                    })
                    .catch(err => {
                        Logger.danger('Ocorreu um erro ao pegar o áudio:', { time: true });
                        Logger.log(err);
                    });
                break;
            }
        }
    }

    tickQueue() {
        if (this.queue.length > 0) {
            if (!this.isPlaying) {
                const currentAudio = this.queue[0];

                this.playAudio(currentAudio)
                    .then(() => {
                        this.queue.shift();
                    })
                    .catch(err => {
                        Logger.danger('Ocorreu um erro ao executar o tts:', { time: true });
                        Logger.log(err);
                    })
                    .finally(() => {
                        this.isPlaying = false;
                    });
            }
        }
        setTimeout(this.tickQueue.bind(this), 5e2);
    }
}
