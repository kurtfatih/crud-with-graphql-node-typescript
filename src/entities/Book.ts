import { ObjectType, Field } from "type-graphql"
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
@ObjectType()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id!: string

  @Column()
  @Field()
  title: string

  @Column()
  @Field()
  author: string
}
