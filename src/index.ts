import express, { application } from "express";
import product from './Routes/Product'
import cors from 'cors'
import user from './Routes/user'

// inicializamos espress
const app = express()
// inicializamos el puerto 3000
const port = 4000

// para analizar las solicituted como json.
app.use(express.json())
app.use(cors())
app.use(product)
app.use(user)


app.listen(port, () =>{
    console.log(`Escuchando en el puerto ${port}`)
})