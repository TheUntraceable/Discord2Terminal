import clipboard from "clipboardy"

export const data = {
    name: 'tag',
    async callback(client, subcommand, ...args) {
        if(subcommand === "view") {
            const tag = args[0]
            if(!tag) console.error("Please provide a tag to view.")
            const tagData = await client.db.get(tag)
            if(!tagData) console.error("That tag does not exist.")
            await clipboard.write(tagData)
            console.log(`Copied tag ${tag} to clipboard.`)
            await clipboard.read()
        } else if(subcommand === "create") {
            const [name, ...contents] = args
            if(!name) console.error("Please provide a name for the tag.")
            if(!contents) console.error("Please provide contents for the tag.")
            const tagData = await client.db.get(name)
            if(tagData) console.error("That tag already exists.")
            await client.db.set(name, contents.join(" "))
            console.log(`Created tag ${name}.`)
        } else if(subcommand === "delete") {
            const tag = args[0]
            if(!tag) console.error("Please provide a tag to delete.")
            const tagData = await client.db.get(tag)
            if(!tagData) console.error("That tag does not exist.")
            await client.db.delete(tag)
            console.log(`Deleted tag ${tag}.`)
        } else if(subcommand === "list") {
            const tags = await client.db.keys()
            console.log(tags.join(", "))
        } else {
            console.error("Please provide a valid subcommand.")
        }
    }
}