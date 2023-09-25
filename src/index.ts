import { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/db.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

databaseService.connect()
const express = require('express')
const app = express()
const port = 8888
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
