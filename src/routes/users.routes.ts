import { Router } from 'express'
import { loginController, logoutController, registerController, verifyEmailTokenController } from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
import { validate } from '~/utils/validation'
const usersRouter = Router()

/**
 * Description: login
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', validate(loginValidator), wrapRequestHandler(loginController))

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { email: string, name: string, password: string, date_of_birth: ISO09601, confirm_password: string }
 */
usersRouter.post('/register', validate(registerValidator), wrapRequestHandler(registerController))

/**
 * Description: logout
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access token>}
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/logout',
  validate(accessTokenValidator),
  validate(refreshTokenValidator),
  wrapRequestHandler(logoutController)
)

/**
 * Description: verify email
 * Path: /verify-email
 * Method: POST
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/email-verify',
  validate(emailVerifyTokenValidator),
  wrapRequestHandler(verifyEmailTokenController)
)
export default usersRouter
