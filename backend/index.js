import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
const app = express()
dotenv.config()

const jokes=[
    {id:1,
        title:"this is joke 1",
        content:"this is the content of joke 1"
    },
    {
        id:2,
        title:"this is joke 2",
        content:"this is the content of joke 2"
    },
    {
        id:3,
        title:"this is joke 3",
        content:"this is the content of joke 3" }
    ]

app.use(cors())

app.get('/', (req, res) => {
  res.send('server is ready!')
})

app.get('/login',(req,res)=>{
    res.send('<h2>login required to move further</h2>')
})
app.get('/jokes',(req,res)=>{
    res.send(jokes)
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})