import {
  Resolver,
  Query,
  Ctx,
  Mutation,
  Arg,
  Field,
  InputType
} from "type-graphql"
import { DEFAULT_EXPIRE_SECOND } from "../constants/redisConfig"
import { ContextTypes } from "../context/types"
import { Book } from "../entities/Book"

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
      const books = await Book.find()
      await redis.setEx("books", DEFAULT_EXPIRE_SECOND, JSON.stringify(books))
      return books
    } else {
      const res = JSON.parse(checkRedis) as [Book]
      return res
    }
  }

  @Mutation(() => Book)
  async book(@Arg("id") id: string) {
    const book = await Book.findOne({ id })
    return book
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg("id") id: string): Promise<boolean> {
    await Book.delete(id)
    return true
  }
  @Mutation(() => Boolean)
  async deletesBooks(): Promise<boolean> {
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
  async updateBook(
    @Arg("id") id: string,
    @Arg("updateInput") updateFields: BookInput
  ): Promise<boolean> {
    await Book.update(id, updateFields)
    return true
  }
}
