import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'

export interface UserType {
  _id?: ObjectId
  name?: string
  email: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus

  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}
