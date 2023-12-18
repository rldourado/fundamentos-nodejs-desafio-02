// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string

      created_at: string
      updated_at: string
    },

    meals: {
      id: string
      description: string
      meal_time: string
      in_diet: boolean
      user_id: string

      created_at: string
      updated_at: string
    }
  }
}
