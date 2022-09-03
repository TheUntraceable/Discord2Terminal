export default {
    name: "ready",
    async callback(payload) {
        let subscribed = 0
        const spinner = createSpinner("Subscribing to events to Discord...").start()
        const guilds = await client.getGuilds()
        client.guilds = guilds.guilds
    
        for(const guild of client.guilds) {
            const channels = await client.getChannels(guild.id)
            for(const channel of channels.filter(channel => channel.type == 0)) {
                client.channels[channel.id] = []
                await client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
                subscribed++
            }
        }
        spinner.success({
            text: `Subscribed to MESSAGE_CREATE for ${subscribed}/${Object.keys(client.channels).length} channels!`
        })
        await parseCommands()    
    }
}