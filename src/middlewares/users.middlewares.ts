import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { HTTP_STATUS } from '~/constants/httpStatusCode'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/db.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'

export const loginValidator = checkSchema(
  {
    email: {
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) })

          if (user === null) throw new Error(USER_MESSAGES.USER_OR_PASSWORD_IS_INCORRECT)

          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
      isString: { errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING },
      isLength: {
        options: {
          min: 6,
          max: 20
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_FROM_6_TO_20
      },
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BR_STRONG
      }
    }
  },
  ['body']
)

export const registerValidator = checkSchema(
  {
    name: {
      notEmpty: {
        errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true
    },
    email: {
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await usersService.checkEmailExist(value)

          if (isExistEmail) throw new Error('Email already exists')

          return true
        }
      }
    },
    password: {
      notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
      isString: { errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING },
      isLength: {
        options: {
          min: 6,
          max: 20
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_FROM_6_TO_20
      },
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BR_STRONG
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
      isString: true,
      trim: true,
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: USER_MESSAGES.DAY_OF_BIRTH_MUST_BE_ISO8601
      }
    }
  },
  ['body']
)

export const accessTokenValidator = checkSchema(
  {
    Authorization: {
      notEmpty: {
        errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_INVALID
      },
      custom: {
        options: async (value: string, { req }) => {
          const access_token = (value || '').split(' ')[1]

          if (!access_token)
            throw new ErrorWithStatus({
              message: USER_MESSAGES.ACCESS_TOKEN_IS_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })

          const decoded_authorization = await verifyToken({
            token: access_token,
            secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
          })
          req.decoded_authorization = decoded_authorization
          return true
        }
      }
    }
  },
  ['headers']
)

export const refreshTokenValidator = checkSchema({
  refresh_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        try {
          const [decoded_refresh_token, refresh_token] = await Promise.all([
            verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
            databaseService.refreshToken.findOne({ token: value })
          ])

          if (!refresh_token)
            throw new ErrorWithStatus({
              message: USER_MESSAGES.REFRESH_TOKEN_DOES_NOT_EXIST,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          req.decoded_refresh_token = decoded_refresh_token
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          throw error
        }
        return true
      }
    }
  }
})

export const emailVerifyTokenValidator = checkSchema({
  email_verify_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        try {
          const decoded_email_verify_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
          })

          req.decoded_email_verify_token = decoded_email_verify_token
        } catch (error) {
          throw new ErrorWithStatus({
            message: capitalize((error as JsonWebTokenError).message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }

        return true
      }
    }
  }
})
