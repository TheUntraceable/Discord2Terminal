import { Routes } from 'discord.js';
import chalk from 'chalk';

export default async payload => {
    if(!payload.message.content) return
    for(const contentParsed of payload.message.content_parsed) {
        if(contentParsed.type == "emoji") {
            if(contentParsed.surrogate) return
            // console.log(`<${contentParsed.animated ? "a" : ""}${contentParsed.name}${contentParsed.emojiId}>`)
            // console.log(contentParsed)
            payload.message.content.replace(`<${contentParsed.animated ? "a" : ""}${contentParsed.name}${contentParsed.emojiId}>`, contentParsed.name)
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
    }
}