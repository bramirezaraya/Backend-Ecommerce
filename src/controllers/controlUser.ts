import { PrismaClient, Prisma, Gender } from "@prisma/client"
import { Request, Response } from "express"
import * as validar from '../lib/validarPassword'
import bcrypt from 'bcrypt'
import { PrimeraImagen } from "../lib/RutaImagenes"
import {GenerateToken} from '../lib/Token'

const prisma = new PrismaClient()

export const Register = async(req:Request, res:Response) =>{

    const {email, password, name} = req.body    
    try{

        const emailUser = await prisma.user.findFirst({
            where:{email:email}
        })

        if(emailUser) return res.status(500).json({message:'Usuario ya registrado, Por favor ingrese otro email.'})

        if(!validar.validarPassword(password)) return res.status(500).json({message:'Contraseña no valida, Ingrese otra.'})

        const User = await prisma.user.create({
            data:{
                email:email,
                password:await bcrypt.hash(password, 10), // para encriptar la contraseña.
                name:name
            },
            select:{
                email:true,
                name:true
            }
        })

        return res.status(200).json({
            message:'Usuario creado con exito!',
            User
        })

    }catch(error){
        return res.status(404).json({message:error})
    }

}


export const Login = async(req:Request, res:Response) =>{

    const {email, password} = req.body


    try{

        const user = await prisma.user.findFirst({
            where:{email},
            select:{
                email:true,
                password:true,
                name:true,
                id:true
            }
        })

        // en caso que no se haya encontrado el usuario.
        if(!user) return res.status(500).json({message:'Usuario no registrado, Por favor ingrese otro email.', success:0,})

        if(await bcrypt.compare(password, user.password)){
            // actualizao el lastLogin al momento que inicia sesión.
            await prisma.user.update({
                where:{id:user.id},
                data:{lastLogin:new Date()}           
            })
            return res.status(200).json({
                message:`Bienvenido ${user.name}`,
                user:user.id,
                name:user.name,
                email:user.email,
                success:1,
                token: GenerateToken(user.id, user.name) // generamos el token del usuario.
            })
        }

        return res.status(500).json({
            message:'Contraseña no valida.',
            success:0
        })

    }catch(error){
        return res.status(404).json({message:error})
    }
}


/// ver productos del carrito del usuario
export const UserCart = async(req:Request, res:Response) =>{

    const userId = req.query.userId as string

    try{
        // buscamos los productos del user.
        const userCart = await prisma.cart.findMany({
            where:{idUser:parseInt(userId)},
            select:{idProducto:true, quantity:true}
        })

        // si el usuario no tiene productos en el carrito 
        if(userCart.length === 0) return res.status(200).json({message:'No hay productos en el carrito', success:0})

        

        // pasamos los productos encontrados a un array con sus id.
        const arrayProducts = userCart.map((item, index) => {
            return item.idProducto
        })
        // buscamos los productos con su id..
        const productos = await prisma.product.findMany({
            where:{id: {in:arrayProducts}}
        })

        // agregamos la imagen del producto.
        const products = await Promise.all(
            productos.map(async(item, index) =>{
                    const nuevaRuta = PrimeraImagen(item.imageUrl, item.name)
                    return {
                        ...item,
                        imageUrl:nuevaRuta
                    }
            })
        )

        const ProductosOrdenados = [...products];
        // ordenamos los productos de la misma manera que esta ordenado el usercart.
        ProductosOrdenados.sort((a, b) => {
            const indexA = userCart.findIndex(item => item.idProducto === a.id);
            const indexB = userCart.findIndex(item => item.idProducto === b.id);

            return indexA - indexB;
        });

        // retornamos los productos del carrito.
        return res.status(200).json({message:'Productos del carrito', ProductosOrdenados, userCart, success:1})

    }catch(error){
        return res.status(500).json({message:error})
    }

}


export const getUserFavorites = async (req:Request, res:Response) =>{
    const idUser = req.query.idUser as string

    try{

        // buscamos los productos agregados a favoritos.
        const favorites = await prisma.userFavorites.findMany({
            where:{idUser:parseInt(idUser)},
            select:{idProduct:true}
        })

        // si no tenemos productos en favoritos retonarmos el siguiente mensaje.
        if(favorites.length === 0) return res.status(500).json({message:'No hay productos agregados en favoritos.', success:0})

        // pasamos todos el objecto favorites a un array.
        const arrayFavorites = favorites.map(item => item.idProduct)
        
        const productosFavorites = await prisma.product.findMany({
            where:{id : {in:arrayFavorites}}
        })

        const productFav = await Promise.all(
            productosFavorites.map( async(item, index) =>{
                const nuevaRutaImagen = PrimeraImagen(item.imageUrl, item.name)
                return {
                    ...item,
                    imageUrl:nuevaRutaImagen
                }
            })
        )

        return res.status(200).json({message:'Productos Favoritos.', productFav, success:1})

    }catch(error){
        res.status(404).json({
            message:error
        })
    }
}