const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const inializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}

inializeDBAndServer()
app.get('/todos/', async (request, response) => {
  const {status, priority, search_q} = request.query
  if (
    priority === undefined &&
    search_q === undefined &&
    status !== undefined
  ) {
    const statusQuery = `select * from todo where status like "${status}"`
    const statusArray = await db.all(statusQuery)
    response.send(statusArray)
  } else if (
    priority !== undefined &&
    search_q === undefined &&
    status === undefined
  ) {
    const priorityQuery = `select * from todo where priority like "${priority}"`
    const priorityArray = await db.all(priorityQuery)
    response.send(priorityArray)
  } else if (
    priority !== undefined &&
    search_q === undefined &&
    status !== undefined
  ) {
    const statusAndpriorityQuery = `select * from todo where status like "${status}" and priority like "${priority}"`
    const statusAndpriorityArray = await db.all(statusAndpriorityQuery)
    response.send(statusAndpriorityArray)
  } else {
    const searchQuery = `select * from todo where todo like "%${search_q}%"`
    const searchArray = await db.all(searchQuery)
    response.send(searchArray)
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `select * from todo where id=${todoId}`
  const specificToDo = await db.get(query)
  response.send(specificToDo)
})
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const query = `insert into todo (id,todo,priority,status) values (${id},'${todo}','${priority}','${status}')`
  await db.run(query)
  response.send('Todo Successfully Added')
})
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body
  if (status !== undefined && priority === undefined && todo === undefined) {
    const query = `update todo set status="${status}" where id=${todoId}`
    await db.run(query)
    response.send('Status Updated')
  } else if (
    status === undefined &&
    priority !== undefined &&
    todo === undefined
  ) {
    const query = `update todo set priority="${priority}" where id=${todoId}`
    await db.run(query)
    response.send('Priority Updated')
  } else {
    const query = `update todo set todo="${todo}" where id=${todoId}`
    await db.run(query)
    response.send('Todo Updated')
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `delete from todo where id =${todoId}`
  await db.run(query)
  response.send('Todo Deleted')
})
module.exports = app
