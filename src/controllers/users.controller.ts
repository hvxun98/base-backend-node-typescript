import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'hvxun@gmail.com' && password === 1) {
    return res.status(200).json({
      message: 'login success'
    })
  }

  return res.status(400).json({
    message: 'login failed'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {

    const result = await usersService.register(req.body)

    return res.status(200).json({ 
      message: 'create success',
      result
    })
 
}
