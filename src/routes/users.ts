import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get(
    '/',
    async (request) => {
      const { sessionId } = request.cookies

      const users = await knex('users')
        .select()

      return { users }
    },
  )

  app.get(
    '/:id',
    async (request, reply) => {
      const { sessionId } = request.cookies

      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUserParamsSchema.parse(request.params)
  
      reply.cookie('userId', id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
  
      const user = await knex('users')
        .where({
          id,
        })
        .first()

      return { user }
    },
  )

  app.post('/', async (request, reply) => {
    // { name }

    const createTransactionBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('users').insert({
      id: randomUUID(),
      name,
    })

    return reply.status(201).send()
  })
}
