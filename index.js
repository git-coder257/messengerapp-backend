import express, { response } from "express"
import pkg from 'pg';
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "orsomworld",
  port: "5433",
})

// const pool = new Pool({
//   host: "ec2-54-220-223-3.eu-west-1.compute.amazonaws.com",
//   user: "fqqxofukvkocqq",
//   password: "9e43d996e5a6d1e39768b738dc625c62656159aa1b6795b5fa02e47f4e495376",
//   database: "dckq3injkdrlea",
//   port: "5432",
// })

// export const query = (text, params) => pool.query(text, params)

const query = (text, params) => pool.query(text, params)

app.post("/users", async(req, res) => {
        await query("INSERT INTO users (username, password) VALUES($1, $2);", [req.body.username, req.body.password])
    })
    
app.get("/users/:username", async(req, res) => {    
    let result = await query("SELECT * FROM users WHERE username = $1;", [req.params.username])

    console.log(result.rows)

    res.json (
        result.rows
    )
})

app.post("/createchat", async(req, res) => {

    // titleofchat
    // peopleinchat
    // listofadmins
    // username
    
    let { id } = (await query("INSERT INTO chats (title) VALUES($1) RETURNING id;", [req.body.titleofchat])).rows[0]

    for (let i = 0; i < req.body.peopleinchat.length; i++){
        let currentuser = await (await query("SELECT * FROM users WHERE username = $1;", [req.body.peopleinchat[i]])).rows[0]

        await query("INSERT INTO chatsyouarein (id, title, user_id) VALUES ($1, $2, $3);", [id, req.body.titleofchat, currentuser.id])
        await query("INSERT INTO peopleinchat (chat_id, user_id, username) VALUES ($1, $2, $3);", [id, currentuser.id, req.body.peopleinchat[i]])
    }

    res.json({
        id: id
    })
})

app.get("/chats/:username", async(req, res) => {
    let accountid = await (await query("SELECT id FROM users WHERE username = $1;", [req.params.username])).rows[0].id
    let chats = await (await query("SELECT id, title FROM chatsyouarein WHERE user_id = $1;", [accountid])).rows

    console.log(chats)

    res.json ({
        chats: chats
    })
})

app.get("/chat/:id", async (req, res) => {
    let chat = await query("SELECT * FROM chats WHERE id = $1;", [req.params.id])

    console.log("chat", chat.rows)

    // chat.rows[0].value = chat.rows[0]

    res.json ({
        chat: chat.rows[0]
    })
})

app.get("/messages/:id", async(req, res) => {
    let messages = await (await query("SELECT * FROM messages WHERE chat_id = $1;", [req.params.id])).rows

    res.json ({
        messages: messages
    })
})

app.post("/addmessage", async(req, res) => {

    const { chat_id, messagetype, messagetosend, personmessagefrom } = req.body

    await query("INSERT INTO messages (chat_id, message_type, messagetosend, personmessagefrom) VALUES ($1, $2, $3, $4);", [chat_id, messagetype, messagetosend, personmessagefrom])
})

app.put("/updatecurrentchatid", async (req, res) => {

    const { username, idofcurrentchat } = req.body

    console.log(username)
    console.log(idofcurrentchat)
    
    query("UPDATE users SET idofcurrentchat = $1 WHERE username = $2;", [idofcurrentchat, username])
})

app.delete("/deletechat/:id", async (req, res) => {
    // const { id } = req.body
    const { id } = req.params

    query("DELETE FROM chats WHERE id = $1;", [id])
    query("DELETE FROM peopleinchat WHERE chat_id = $1;", [id])
    query("DELETE FROM chatsyouarein WHERE id = $1;", [id])
})

app.post("/makepersonadmin", async (req, res) => {

    const { username, chat_id } = req.body

    const { id } = await (await query("SELECT id FROM users WHERE username = $1;", [username])).rows[0]

    console.log(username, id)

    query("INSERT INTO adminsofchat (chat_id, username, user_id) VALUES ($1, $2, $3);", [chat_id, username, id])
})

app.get("/ispersonadmin/:username/:password/:chat_id", async (req, res) => {
    const { username, password, chat_id } = req.params
    
    let ispersonadmin = false

    try {
        const { id } = await (await query("SELECT id FROM users WHERE username = $1 AND password = $2;", [username, password])).rows[0]
        
        if (await (await query("SELECT * FROM adminsofchat WHERE user_id = $1 AND chat_id = $2;", [id, chat_id])).rows.length > 0){
            ispersonadmin = true
        }
    } catch (error) {
        
    }

    console.log(username, password, chat_id)

    res.json({
        personadmin: ispersonadmin
    })
})

app.get("/currentchatid/:username", async (req, res) => {

    const username = req.params.username

    const { rows } = await query("SELECT * FROM users WHERE username = $1", [username])

    const currentchatid = rows[0].idofcurrentchat

    res.json({
        currentchatid: currentchatid
    })
})

app.post("/sendimage", async (res, req) => {
    const { image_url, chat_id, personmessagefrom } = req.body

    query("INSERT INTO messages (chat_id, message_type, messagetosend, personmessagefrom) VALUES ($1, $2, $3, $4);", [chat_id, "img", image_url, personmessagefrom])
})

app.listen(3000)