import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatusCode'
import { USER_MESSAGES } from '~/constants/messages'
import { RegisterReqBody, TokenPayload } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/db.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const { _id } = user

  const result = await usersService.login(_id.toString())
  return res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)

  return res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.status(HTTP_STATUS.OK).json(result)
}

export const verifyEmailTokenController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user)
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })

  // verified, return status ok
  if (!user.email_verify_token)
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })

  const result = await usersService.verifyEmail(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.EMAIL_VERIFIED,
    result
  })
}
