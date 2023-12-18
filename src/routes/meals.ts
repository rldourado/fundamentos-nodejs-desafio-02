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
      const { userId } = request.cookies

      console.log(`userId: ${userId}`)

      const meals = await knex('meals')
        .where({
          user_id: userId,
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
      const { userId } = request.cookies

      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUserParamsSchema.parse(request.params)

      const user = await knex('users')
        .where({
          user_id: userId,
          id,
        })
        .first()

      return { user }
    },
  )

  app.post('/', async (request, reply) => {
    // { description, meal_time, in_diet, user_id }

    const createTransactionBodySchema = z.object({
      description: z.string(),
      meal_time: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
