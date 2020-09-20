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

        if (message.content.startsWith('-ma')) {
            this.setMuteAll(channel, true);
        }

        if (message.content.startsWith('-ua')) {
            this.setMuteAll(channel, false);
        }
    }

    setMuteAll(channel, action) {
        const members = channel.members.array();

        members.forEach(member => {
            member.voice.setMute(action);
        });
    }
}
