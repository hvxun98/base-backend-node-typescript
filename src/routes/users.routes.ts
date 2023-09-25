import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
import { validate } from '~/utils/validation'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { email: string, name: string, password: string, date_of_birth: ISO09601, confirm_password: string }
 */
usersRouter.post('/register', validate(registerValidator) ,wrapRequestHandler(registerController))

export default usersRouter
