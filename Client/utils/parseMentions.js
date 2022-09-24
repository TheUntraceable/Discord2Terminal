import { Routes } from 'discord.js';
import chalk from 'chalk';

export default async payload => {
    if(!payload.message.content) return
    if(payload.message.author.id == "507969622876618754") {console.log(payload.message.content_parsed);console.log()}
    for(const contentParsed of payload.message.content_parsed) {
        if(contentParsed.type == "emoji") {
            payload.message.content.replace(`<${contentParsed.animated ? "a" : ""}:${contentParsed.name}:${contentParsed.id}>`)
        } else if(contentParsed.type == "mention") {
            console.log(contentParsed)
            for(const content of contentParsed.content) {
                payload.message.content.replace(`<@${contentParsed.roleId}>`, chalk.bgHex(`#${contentParsed.roleColour || "7289da"}`).whiteBright(`@${content.content}`))
            }
        }
    }
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