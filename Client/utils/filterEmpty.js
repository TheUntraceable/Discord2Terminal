export default async (channelId, channel) => {
    channel.created.filter(Boolean)
    channel.updated.filter(Boolean)
    channel.deleted.filter(Boolean)
    await payload.client.channels.set(channelId, channel)
    const channel = await payload.client.channels.get(channelId)
    return channel
}