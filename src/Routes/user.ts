import Router from "express"
import * as user from '../controllers/controlUser'
import { ValidarToken } from "../lib/tokenValidation"

const router = Router()


router.post('/Register',user.Register) // register, se pide name,email,password
router.post('/Login', user.Login) // login, se pide email y password.
router.get('/userCart',ValidarToken, user.UserCart) //productos del carrito del usuario
router.get('/favorites', ValidarToken, user.getUserFavorites) // listar productos en favoritos del usuario


export default router