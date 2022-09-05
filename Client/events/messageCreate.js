import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
    renderer: new TerminalRenderer()
});

export const data = {
    name: "MESSAGE_CREATE",
    async callback(payload) {
        
        payload.message.content = marked(payload.message.content)
        payload.client.channels[payload.channel_id].created.push(payload.message)
    }
}