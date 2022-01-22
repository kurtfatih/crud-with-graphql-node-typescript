import { RedisClientType, RedisModules, RedisScripts } from "redis"

export type ContextTypes = {
  redis: RedisClientType<RedisModules, RedisScripts>
}
