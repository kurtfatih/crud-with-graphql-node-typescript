import { ApolloServer, gql } from "apollo-server"
import "reflect-metadata"
import {
  ObjectType,
  Field,
  ID,
  Args,
  Query,
  Resolver,
  buildSchema,
  Arg
} from "type-graphql"

const books = [
  {
    bookId: "1",
    title: "The Awakening",
    author: "Kate Chopin"
  },
  {
    bookId: "2",
    title: "City of Glass",
    author: "Paul Auster"
  }
]

@ObjectType()
class Book {
  @Field(() => ID)
  bookId: string
  @Field()
  title: string
  @Field()
  author: string
}

@Resolver(Book)
class BookResolver {
  private booksCollection: Book[] = []
  @Query(() => [Book])
  books() {
    return books
  }

  @Query(() => Book)
  getById(@Arg("id") id: string) {
    return books.filter(({ bookId }) => bookId === id)[0]
  }
}
// const typeDefs = gql`
//   # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

//   # This "Book" type defines the queryable fields for every book in our data source.
//   type Book {
//     title: String
//     author: String
//   }

//   # The "Query" type is special: it lists all of the available queries that
//   # clients can execute, along with the return type for each. In this
//   # case, the "books" query returns an array of zero or more Books (defined above).
//   type Query {
//     books: [Book]
//   }
// `
// const resolvers = {
//   Query: {
//     books: () => books
//   }
// }
const main = async () => {
  try {
    const schema = await buildSchema({
      resolvers: [BookResolver]
    })

    const server = new ApolloServer({ schema })

    // The `listen` method launches a web server.
    server.listen().then(({ url }: { url: string }) => {
      console.log(`🚀  Server ready at ${url}`)
    })
  } catch (e) {
    console.error(e)
  }
}
main()
