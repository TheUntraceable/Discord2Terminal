import { Routes } from 'discord.js';
import chalk from 'chalk';
export const parseMentions = async payload => {
    for(const word of payload.message.content.split(" ")) {
        const matches = word.matchAll('<@!?([0-9]{15,20})>$').next().value;
    
        if (!matches) continue;
        
        const id = matches[1];
        if(!id) continue;
        if(!payload.client.users[String(id)]) {
            const _user = await payload.client.rest.get(Routes.user(id))
            if(!_user) continue
            payload.client.users[String(id)] = _user
        }
        const user = payload.client.users[String(id)]
        payload.message.content = payload.message.content.replace(`<@${id}>`, (chalk.bgHex("#7289da")(`@${user.username}#${user.discriminator}`)))
    }
}
