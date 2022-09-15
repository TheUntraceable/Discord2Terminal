const filterFunction = message => message !== undefined && message !== null

export default async (client, channelId, channel) => {
    channel.created.filter(filterFunction)
    channel.updated.filter(filterFunction)
    channel.deleted.filter(filterFunction)
    await client.channels.set(channelId, channel)
    return await client.channels.get(channelId)
}