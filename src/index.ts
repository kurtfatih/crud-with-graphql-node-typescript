import { ApolloServer } from "apollo-server"
import { createClient } from "redis"
import "reflect-metadata"
import {
  ObjectType,
  Field,
  Query,
  Resolver,
  buildSchema,
  Arg,
  Ctx,
  Mutation,
  InputType
} from "type-graphql"
import { createConnection, getConnection } from "typeorm"
import { ContextTypes } from "./context/types"
import { Book } from "./entities/Book"

const DEFAULT_EXPIRE_SECOND = 3600
@InputType({ description: "book input" })
class BookInput {
  @Field()
  author: string
  @Field()
  title: string
}

@Resolver(Book)
class BookResolver {
  @Query(() => [Book])
  async books(@Ctx() { redis }: ContextTypes) {
    const checkRedis = await redis.get("books")
    if (!checkRedis) {
      const books = await Book.createQueryBuilder("books").getMany()
      await redis.setEx("books", DEFAULT_EXPIRE_SECOND, JSON.stringify(books))
      return books
    } else {
      console.log("cached")
      const res = JSON.parse(checkRedis) as [Book]
      console.log(res)
      return res
    }
  }

  @Mutation(() => Book)
  async getBookById(@Arg("id") id: string) {
    const book = await Book.findOne({ id })
    return book
  }

  @Mutation(() => Boolean)
  async deleteBooksById(@Arg("id") id: string): Promise<boolean> {
    await Book.delete(id)
    return true
  }
  @Mutation(() => Boolean)
  async deleteAllBooks(): Promise<boolean> {
    await Book.createQueryBuilder().delete().execute()
    return true
  }
  @Mutation(() => Book)
  async addBook(@Arg("data") data: BookInput): Promise<Book> {
    // const arr = [...books, data] as [Book]
    const res = await Book.create({ ...data }).save()
    return res
  }

  @Mutation(() => Boolean)
  async updateBookById(
    @Arg("id") id: string,
    @Arg("updateInput") updateFields: BookInput
  ): Promise<boolean> {
    await Book.update(id, updateFields)
    return true
  }
}

const main = async () => {
  try {
    const client = createClient()
    client.on("err", (err) => console.log("Redis client error ", err))
    await client.connect()
    const asd = await client.set("key", "test value")
    console.log()
    const value = await client.get("key")

    console.log(value)

    const schema = await buildSchema({
      resolvers: [BookResolver]
    })
    await createConnection().then(() => console.log(`🚀  Database ready`))
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
