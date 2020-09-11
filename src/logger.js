import chalk from 'chalk';

export default class Logger {
    static parse(message, args) {
        let messageResult = '';
        if (args != null) {
            if (args.hasOwnProperty('time')) {
                if (args['time']) {
                    const time = new Date().toLocaleTimeString()
                    messageResult += `[${time}] `;
                }
            }
        }
        messageResult += message;
        console.log(messageResult);
    }

    static danger(message, args = null) {
        Logger.parse(chalk.red('[!] ' + message), args);
    }

    static warning(message, args = null) {
        Logger.parse(chalk.yellow('[!] ' + message), args);
    }

    static info(message, args = null) {
        Logger.parse(chalk.blue(message), args);
    }

    static success(message, args = null) {
        Logger.parse(chalk.green(message), args);
    }

    static log(message, args = null) {
        Logger.parse(message, args);
    }
}
