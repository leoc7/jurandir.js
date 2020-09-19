import Plugin from './base';

export default class MutePlugin extends Plugin {
    constructor() {
        super({
            name: 'Mute all',
            key: 'muteall',
            description: 'Muta todo mundo do canal em que você está',
        });

        this.on('message', message => this.processMessage(message));
        this.enabled = true;
    }

    processMessage(message) {
        const channel = message.member.voice.channel;
        if (!channel) return;

        if (message.content.startsWith('!muteall')) {
            this.muteAll(channel);
        }

        if (message.content.startsWith('!unmuteall')) {
            this.unmuteAll(channel);
        }
    }

    muteAll(channel) {
        const members = channel.members.array();

        for(let member in members) {
            const voice = members[member].voice;

            voice.setMute(true);
        }
    }

    unmuteAll(channel) {
        const members = channel.members.array();

        for(let member in members) {
            const voice = members[member].voice;

            voice.setMute(false);
        }
    }
}
