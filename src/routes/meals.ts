import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get(
    '/',
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const { user_id } = request.cookies

      console.log(`user_id: ${user_id}`)

      const meals = await knex('meals')
        .where({
          user_id,
        })
        .select()

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const { user_id } = request.cookies

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          user_id,
          id,
        })
        .first()

      return { meal }
    },
  )

  app.post('/', async (request, reply) => {
    // { name, description, meal_time, in_diet, user_id }

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      meal_time: z.string(),
      in_diet: z.boolean(),
    })

    const { name, description, meal_time, in_diet } = createMealBodySchema.parse(
      request.body,
    )

    const { user_id } = request.cookies

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      meal_time,
      in_diet,
      user_id,
    })

    return reply.status(201).send()
  })
}
