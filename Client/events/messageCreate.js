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
        if(payload.client.settings.ignoredUsers.includes(payload.message.author.id)) return
        if(payload.client.settings.ignoredBlocked && payload.message.author.blocked) return
        if(!payload.message.content) return
        await parseMentions(payload)
        // payload.message.content = marked(payload.message.content)
        payload.message.content.replace("\n", `\n  `)
        payload.client.users.set(payload.message.author.id, payload.message.author)
        payload.client.channels.push(`${payload.message.channel_id}.created`, payload.message)
    }
}