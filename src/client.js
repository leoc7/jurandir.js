import Config from './config';
import Logger from './logger';
import PluginManager from './plugins/manager';
import { Client as DiscordClient } from 'discord.js';
import MirrorPlugin from './plugins/mirror';
import TTSPlugin, { VOICES as TTSVoices } from './plugins/tts';
import MutePlugin from './plugins/mute';

export default class Client {
    plugins = new PluginManager();

    constructor({ verbose }) {
        this.verbose = verbose;
        this.token = Config.client.token;
        this.client = new DiscordClient();

        this.plugins.add(new MirrorPlugin());
        this.plugins.add(new TTSPlugin());
        this.plugins.add(new MutePlugin());
    }

    connect() {
        this.client.login(this.token);

        this.client.on('ready', () => {
            this.client.user
                .setPresence({
                    activity: {
                        name: Config.client.presence,
                        type: 'PLAYING',
                    },
                    status: 'online',
                })
                .then(() => {
                    if (this.verbose) {
                        Logger.success('Logado com sucesso', { time: true });
                    }
                })
                .catch(err => {
                    if (this.verbose) {
                        Logger.danger('Ocorreu um erro ao definir a presença:', { time: true });
                        Logger.danger(err);
                    }
                });
            this.attachEvents();
        });
    }

    attachEvents() {
        this.client.on('message', message => {
            if (message.author.bot) return;

            if (message.content.startsWith(Config.commands.preffix + ' help')) {
                message.channel.send(this.getHelpMessage());
                return;
            }

            if (message.content.startsWith(Config.commands.preffix + ' status')) {
                message.channel.send(this.getStatusMessage());
                return;
            }

            if (message.content.startsWith(Config.commands.preffix)) {
                const args = message.content.split(' ');

                if (args.length < 3) {
                    message.channel.send(Config.messages.INVALID_COMMAND);
                    return;
                }

                let [, command, value] = args;

                command = command.toLowerCase();
                value = value.toLowerCase();

                if (!this.plugins.exists(command)) {
                    message.channel.send(Config.messages.INVALID_COMMAND);
                    return;
                }

                const plugin = this.plugins.get(command);

                if (plugin.bool) {
                    if (value != 'on' && value != 'off') {
                        message.channel.send(Config.messages.INVALID_COMMAND);
                        return;
                    }

                    value = value === 'on';

                    const isEnabled = plugin.toggle(value);

                    message.channel.send(
                        isEnabled
                            ? Config.messages.ENABLED.replace('[0]', plugin.name)
                            : Config.messages.DISABLED.replace('[0]', plugin.name)
                    );
                }
            }

            this.plugins.emit('message', message);
        });
    }

    getHelpMessage() {
        let message = `${Config.client.name}\n\n`;

        this.plugins.iterate(plugin => {
            message += `[${Config.commands.preffix} ${plugin.key} on]: ${plugin.description}\n`;
        });

        message += '\nVozes:\n';

        TTSVoices.map(voice => {
            message += `[${voice.command}]: ${voice.description}\n`;
        });

        return '```' + message + '```';
    }

    getStatusMessage() {
        let message = `Status do ${Config.client.name}\n\n`;

        this.plugins.iterate(plugin => {
            message += `[${plugin.name}]: ${plugin.enabled ? 'ON' : 'OFF'}\n`;
        });

        return '```' + message + '```';
    }
}
