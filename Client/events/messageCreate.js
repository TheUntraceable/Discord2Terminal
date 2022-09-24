import filterEmpty from '../utils/filterEmpty.js';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import parseMentions from '../utils/parseMentions.js';

marked.setOptions({
    renderer: new TerminalRenderer(),
    unescape: true
});

export const data = {
    name: "MESSAGE_CREATE",
    async callback(payload) {
        if(payload.client.settings.ignoredUsers?.includes(payload.message.author.id)) return
        if(payload.client.settings.ignoreBlocked && payload.message.author.blocked) return
        if(payload.client.settings.ignoreBots)
        if(!payload.message.content) return
        if(!payload.message.author) {
            console.log(payload.message)
            return
        } 
        if(!payload.message.id) {
            console.log("Message ID not found, if this is frequent, reboot. If it persists, restart Discord.")
            return
        }

        if(!await payload.client.channels.has(payload.channel_id)) {
            const channel = await payload.client.getChannel(payload.channel_id)
            await payload.client.channels.set(payload.channel_id, {
                name: channel.name,
                created: [],
                updated: [],
                deleted: []
            })
        }

        
        // payload.message.content = marked(payload.message.content)
        payload.message.content.replace("\n", `\n  `)
        await payload.client.users.set(payload.message.author.id, payload.message.author)
        await parseMentions(payload)
        // await payload.client.channels.push(`${payload.message.channel_id}.created`, payload.message)
        const channel = await payload.client.channels.get(payload.channel_id)
        await filterEmpty(payload.client, payload.channel_id, channel)
        channel.created.push(payload.message)
        await payload.client.channels.set(payload.channel_id, channel)
    }
}