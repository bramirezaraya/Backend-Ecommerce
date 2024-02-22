import { PrismaClient, Prisma, Gender } from "@prisma/client"
import { Request, Response } from "express"
import * as rutaImagenes from '../lib/RutaImagenes'

const prisma = new PrismaClient()


export const getProducts = async(req:Request, res:Response) =>{
    try{
        const productos = await prisma.product.findMany({
            select:{
                name:true,
                id:true,
                description:true,
                imageUrl:true,
                price:true,
                gender:true,
                article:{
                    select:{
                        name:true,
                    }
                },
                liga:{
                    select:{
                        name:true
                    }
                }
            },      
        })

        // modificamos la ruta de la imagen, dandole la primera imagen.
        const productosConRuta = await Promise.all(
            productos.map(async(producto) =>{
                const nuevasRuta = rutaImagenes.PrimeraImagen(producto.imageUrl, producto.name)
                return {
                    ...producto,
                    imageUrl:nuevasRuta
                }
            })
        )
        // funcion para desordenar.
        // const productoDesordenado = productosConRuta.sort(() => {return Math.random() - 0.5})
        
        return res.status(200).json({
            productos:productosConRuta,   
        })
    }catch(error){
        return res.status(404).json({message:'No se pudo obtener los productos.'})
    }
    
} 


export const productoSeleccionado = async(req:Request, res:Response) =>{

    
    const {id} = req.query // pedimos el id por parametro.

    if(!id) return res.status(500).json({message:'Hubo un error, Por favor intentelo nuevamente.'})

    try{
        
        // en caso que encontremos el producto pediremos los datos.
        const producto = await prisma.product.findFirst({
            where:{id: parseInt(id as string)},
            select:{
                name:true,
                description:true,
                price:true,
                imageUrl:true,
                gender:true,
                article:{select:{name:true}},
                liga:{select:{name:true}}

            }
        })

        let productoActualizado
        // modificaremos las rutas de las imagenes, enviendole un array con todas las rutas de las imagenes.
        if(producto){
            const productoRuta = rutaImagenes.rutasImagenes(producto.imageUrl, producto.name) // aplicamos la funcion para concatenar.
             productoActualizado = {...producto, imageUrl:productoRuta} // actualizamos imageUrl.
        }
        
        return res.status(200).json({
            productos:productoActualizado
        })
        
        


    }catch(error){
        return res.status(404).json({
            message:'Producto no encontrado.'
        })
    }

}

/// filtrado por genero.
export const filtroProduct = async(req:Request, res:Response) =>{

    try{
        // tipo articulo, tipo de liga, genero. por precio menor a mayor o mayor a menor.
        let condiciones :any ={}

        const {genero, nombreLiga, idArticulo} = req.query

        // en caso que no aplique filtros, le devolveremos todos los productos sin filtro.
        if(!genero && !nombreLiga && !idArticulo) return getProducts(req,res)
        
        /// propieda in = buscan valores que esten contenidos en un array. ejemplo "in [1,2,3]" esto quiere decir que buscara los valores 1,2,3
        if (genero) {
            condiciones = { ...condiciones, gender: {in: (genero as string).split(',') }};
        }
        if (nombreLiga) {

            const Ligas = (nombreLiga as string).split(',')
            let idLigas:any = []
            // hago un promise.all para que espere y pushee el dato primero antes de continuar.
            await Promise.all(Ligas.map( async(item, index) => { 
                const nuevaId = await prisma.liga.findFirst({
                    where:{name:item}, 
                    select:{id:true}
                })
                return idLigas.push(nuevaId?.id)
            }))

            condiciones = { ...condiciones, idLiga: {in:idLigas} };

        }
        if (idArticulo) {
            condiciones = { ...condiciones, idArticle: {in:(idArticulo as string).split(',').map(Number)} };
        }

        // nombreVariable:{in:[datos...]}
        const producto = await prisma.product.findMany({
            where: condiciones,
            select: {
            name: true,
            id: true,
            description: true,
            imageUrl: true,
            price: true,
            gender: true,
            article: {
                select: {
                name: true,
                },
            },
            liga:{
                select:{
                    name:true
                }}
            },
        });

            const productoActualizado = await Promise.all(
                producto.map(product => {
                    const produ = rutaImagenes.PrimeraImagen(product.imageUrl, product.name)
                    return {...product, imageUrl:produ}
                })
            )
        

        return res.status(200).json({productos:productoActualizado})
    }catch(error){
        console.log(error)
    }

}


// agregar producto al carrito.
export const AddProductCart = async(req:Request, res:Response) =>{

    const idProduct = req.body.idProduct as string
    const userId = req.body.idUser as string

    try{

        const existCart = await prisma.cart.findFirst({
            where:{
                idUser:parseInt(userId),
                idProducto:parseInt(idProduct)
            }
        })

        if(existCart){
            await prisma.cart.update({
                where:{id:existCart.id},
                data:{quantity:existCart.quantity+1},
            })
        } 
        else{
            await prisma.cart.create({
                data:{
                    idProducto:parseInt(idProduct),
                    idUser:parseInt(userId)
                }
            })
        }
        

        return res.status(200).json({message:'Producto agregado al carrito', success:1}) 
        
    }catch(error){
        return res.status(400).json({message:'Ha ocurrido un problema'})
    }
}

// quitar producto del carrito
export const removeProductCart = async(req:Request, res:Response) =>{

    const {idProduct, idUser} = req.query

    try{

        const userProduct = await prisma.cart.findFirst({
            where:{
                idProducto:parseInt(idProduct as string),
                idUser:parseInt(idUser as string)
            }
        })

        if(userProduct){
            if(userProduct.quantity > 1){
                await prisma.cart.update({
                    where:{id:userProduct.id},
                    data:{quantity:userProduct.quantity -1}
                })
            }else{
                await prisma.cart.delete({
                    where:{id:userProduct.id}
                })
            }
            return res.status(200).json({message:'Producto removido', success:1})
        }

        return res.status(500).json({message:'El producto no se pudo encontrar'})

    }catch(error){
        return res.status(404).json({message:error})
    }
}



export const DeleteProductCart = async(req:Request, res:Response) => {

    try{
        const {idUser, idProduct} = req.query

        const Product = await prisma.cart.findFirst({
            where:{idProducto:parseInt(idProduct as string), 
                 idUser: parseInt( idUser as string)
            }
        })

        if(!Product) return res.status(500).json({message:'Producto no encontrado'})


        await prisma.cart.delete({
            where:{id:Product.id}
        })

        return res.status(200).json({message:'Producto Eliminado'})

    }catch(error){
        return res.status(404).json({message:error})
    }
}


export const AddFavorite = async(req:Request, res:Response) =>{

    const {userId, productId} = req.body

    try{

        const productFav = await prisma.userFavorites.findFirst({
            where:{
                idProduct:productId,
                idUser:userId
            }
        })

        if(productFav){
            await prisma.userFavorites.delete({
                where:{id:productFav.id}
            })
            return res.status(200).json({message:'Producto quitado de favoritos.'})
        }

        await prisma.userFavorites.create({
            data:{
                idProduct:productId,
                idUser:userId,
            }
        })
        
        return res.status(200).json({message:'Producto Agregado a favoritos.'})

    }catch(error){
        return res.status(404).json({message:error})
    }
}