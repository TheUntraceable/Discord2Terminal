import { Routes } from 'discord.js';
import chalk from 'chalk';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
    renderer: new TerminalRenderer(),
    mangle: false,
    pedantic: true,
    smartypants: true,
    unescape: true,
});

export default async payload => {
    if(!payload.message.content) return
    for(const contentParsed of payload.message.content_parsed) {
        if(contentParsed.type == "emoji") {
            if(contentParsed.surrogate) return
            for(const word of payload.message.content.split(" ")) {
                if(word.startsWith("<") && word.endsWith(">") && word.includes(contentParsed.emojiId) && word.includes(contentParsed.name)) {
                    payload.message.content = payload.message.content.replace(word, contentParsed.name)
                }
            }
        } else if(contentParsed.type == "mention") {
            for(const content of contentParsed.content) {
                if(contentParsed.roleId) {
                    payload.message.content.replace(`<@&${contentParsed.roleId}>`, chalk.bgHex(`#${contentParsed.roleColour || "7289da"}`)(content.content))
                }
            }
        }
    }

    for(const word of payload.message.content.split(" ")) {
        const matches = word.matchAll('<@!?([0-9]{15,20})>$').next().value;
        
        if (!matches) continue;
        
        const id = matches[1];
        if(!id) continue;
        if(!payload.client.users[String(id)]) {
            try {
                const _user = await payload.client.rest.get(Routes.user(id))
                if(!_user) continue
                payload.client.users[String(id)] = _user
            } catch {
                continue
            }
        }
        const user = payload.client.users[String(id)]
        payload.message.content = payload.message.content.replace(`<@${id}>`, (chalk.bgHex("#7289da")(`@${user.username}#${user.discriminator}`)))
        payload.message.content = marked.parseInline(payload.message.content)
    }
}