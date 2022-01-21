import { ObjectType, Field, ID } from "type-graphql"
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
@ObjectType()
export class Book extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @Field(() => String)
  title: string

  @Column()
  @Field()
  author: string
}
