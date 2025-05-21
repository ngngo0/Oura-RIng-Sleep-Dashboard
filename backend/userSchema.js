// userSchema.js

export const userSchema = {
  id: 'number', // id must be a number
  nickname: 'string', // nickname must be a string
  email: 'string', // email must be a string
  notes: 'string|null' // notes is optional, can be string or null
}