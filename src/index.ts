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
  Mutation,
  InputType
} from "type-graphql"
import { createConnection, getConnection } from "typeorm"
import { Book } from "./entities/Book"

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
  async books() {
    const books = await Book.createQueryBuilder("books").getMany()
    return books
  }

  @Mutation(() => Book)
  async getBookById(@Arg("id") id: number) {
    const book = await Book.findOne({ id })
    return book
  }

  @Mutation(() => Boolean)
  async deleteBooksById(@Arg("id") id: number): Promise<boolean> {
    await Book.delete(id)
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
    @Arg("id") id: number,
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
    await client.set("key", "test value")
    const value = await client.get("key")

    console.log(value)

    const schema = await buildSchema({
      resolvers: [BookResolver]
    })
    await createConnection().then(() => console.log(`🚀  Database ready`))
    const server = new ApolloServer({
      schema
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
