export const data = {
    name: "eval",
    async callback(client, code) {
        return await eval(code)
    }
}