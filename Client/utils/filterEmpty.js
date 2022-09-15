export default async (client, channelId, channel) => {
    channel.created.filter(Boolean)
    channel.updated.filter(Boolean)
    channel.deleted.filter(Boolean)
    await client.channels.set(channelId, channel)
    const newChannel = await client.channels.get(channelId)
    return newChannel
}