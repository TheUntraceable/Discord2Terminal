import { marked } from 'marked';
import { Routes } from 'discord.js';
import TerminalRenderer from 'marked-terminal';
import chalk from 'chalk';

marked.setOptions({
    renderer: new TerminalRenderer(),
    unescape: true
});

export const data = {
    name: "MESSAGE_CREATE",
    async callback(payload) {
        if(!payload.message.content) return
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
            console.log(`@${user.username}#${user.discriminator}`)
            payload.message.content = payload.message.content.replace(`<@${id}>`, (chalk.bgHex("#7289da")(`@${user.username}#${user.discriminator}`)))
        }
        // payload.message.content = marked(payload.message.content)
        payload.message.content.replace("\n", `\n  `)
        payload.client.users[payload.message.author.id] = payload.message.author
        payload.client.channels[payload.channel_id].created.push(payload.message)
    }
}