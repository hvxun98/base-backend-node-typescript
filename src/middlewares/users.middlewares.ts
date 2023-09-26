import { checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/db.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'

export const loginValidator = checkSchema({
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
})

export const registerValidator = checkSchema({
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
})
