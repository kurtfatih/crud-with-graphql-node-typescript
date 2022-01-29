import { ApolloServer } from "apollo-server"
import { createClient } from "redis"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"
import { Book } from "./entities/Book"

const main = async () => {
  try {
    //database connection
    await createConnection().then(() => console.log(`🚀  Database ready`))
    const client = createClient()

    //redis connection
    client.on("err", (err) => console.log("Redis client error ", err))
    await client.connect()

    const schema = await buildSchema({
      resolvers: [Book]
    })
    const server = new ApolloServer({
      schema,
      context: { redis: client }
    })
    // The `listen` method launches a web server.
    server.listen().then(({ url }: { url: string }) => {
      console.log(`🚀  Server ready at ${url}`)
    })
  } catch (e) {
    console.error(e)
  }
}
main().catch((e) => console.log(e))
