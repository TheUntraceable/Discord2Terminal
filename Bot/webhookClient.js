import got from "got"
import chalk from "chalk"

class Webhook {
    constructor(webhookId, webhookToken) {
        this.webhookId = webhookId
        this.webhookToken = webhookToken
        this.url = `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`
    }
}

class RatelimitedWebhook extends Webhook {
    constructor(webhookId, webhookToken, expireIn) {
        super(webhookId, webhookToken)
        this.expireIn = expireIn
    }
}

const sleep = async seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000))

export default class WebhookClient {
    constructor(webhooks) {
        this.webhooks = webhooks // A list of Webhook
        this.ratelimited = [] // A list of RatelimitedWebhook
    }

    async findAvailableWebhook() {
        console.log("LOgged")
        if(this.webhooks[0]) {
            console.log(chalk.green.underline("Found available webhook!"))
            return this.webhooks[0]
        } else {
            console.log(chalk.yellow.underline("No available webhooks! Waiting for the shortest webhook to reset..."))
            var shortest;
            for(const webhook of this.ratelimited) {
                if(!shortest || shortest.expireIn > webhook.expireIn) {
                    shortest = webhook
                }
            }
            console.log(chalk.yellow(`Webhook ${shortest.webhookId} is on cooldown for ${webhook.expireIn} seconds, waiting...`))
            await sleep(shortest.expireIn + 1)
            return shortest
        }
    }

    async execute(webhook, message, author) {
        console.log(chalk.green.underline("Executing webhook..."))
        const response = await got.post(`${webhook.url}?wait=true`, {
            json: {
                content: message,
                username: author.username,
                avatar_url: author.avatar
            }
        })

        if(response.status == 429) {
            console.log(chalk.red.underline.bold(`Webhook ${webhook.webhookId} is ratelimited! Adding it to the cooldown list...`))
            this.ratelimited.push(new RatelimitedWebhook(webhook.webhookId, webhook.webhookToken, response.data.retry_after))
            setTimeout(() => {
                console.log(chalk.yellow.underline(`Webhook ${webhook.webhookId} is no longer ratelimited!`))
                this.ratelimited = this.ratelimited.filter(webhook => webhook.webhookId != webhook.webhookId)

            })
            const newWebhook = await this.findAvailableWebhook()
            if(newWebhook) {
                console.log(chalk.green.underline.bold(`Found available webhook! Retrying execution of webhook ${newWebhook.webhookId}...`))
                return await this.execute(newWebhook, message, author)
            }
        } else if(response.headers["X-RateLimit-Remaining"] == 0) {
            this.ratelimited.push(new RatelimitedWebhook(webhook.webhookId, webhook.webhookToken, response.headers["X-RateLimit-Reset-After"]))
            setTimeout(() => {
                this.ratelimited = this.ratelimited.filter(webhook => webhook.webhookId != webhook.webhookId)
            }, response.headers["X-RateLimit-Reset-After"])
        } else if(response.status == 204) {
            return response.data
        }
    }
}