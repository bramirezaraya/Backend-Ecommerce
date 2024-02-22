import Router from "express";
import * as product from '../controllers/ControlProduct'
import { ValidarToken } from "../lib/tokenValidation"

const router = Router()

router.get('/productos', product.getProducts) // listar productos
router.get('/productoSeleccionado', product.productoSeleccionado) //listar un producto seleccionado.
router.get('/productos/filtrados', product.filtroProduct) //filtrar productos
router.post('/addProductCart', ValidarToken, product.AddProductCart) // agregar un producto al carrito
router.delete('/removeProductCart',ValidarToken, product.removeProductCart) // eliminar un producto del carrito
router.post('/addProductFavorite', ValidarToken, product.AddFavorite) //agregar articulo a favoritos
router.delete('/deleteProduct', ValidarToken, product.DeleteProductCart) // eliminar un producto inmediatamente.

export default router