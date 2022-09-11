import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import { parseMentions } from '../utils/parseMentions';

marked.setOptions({
    renderer: new TerminalRenderer(),
    unescape: true
});

export const data = {
    name: "MESSAGE_CREATE",
    async callback(payload) {
        if(!payload.message.content) return
        await parseMentions(payload)
        // payload.message.content = marked(payload.message.content)
        payload.message.content.replace("\n", `\n  `)
        payload.client.users[payload.message.author.id] = payload.message.author
        payload.client.channels[payload.channel_id].created.push(payload.message)
    }
}