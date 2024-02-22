import {Gender, PrismaClient} from "@prisma/client"
import { producto } from "./productos";
import { articulo } from "./articulo";
import { Liga } from "./ligas";

const prisma = new PrismaClient()

// obtener id de la liga a traves de su nombre.
const idLiga = async(NameLiga:string) : Promise<number | undefined> =>{
    try{
        const idLiga = await prisma.liga.findFirst({
            where:{name:NameLiga},
            select:{id:true}
        })
        return idLiga?.id
    }catch(error){
        return undefined
    }
}

// obtener id de la articulo a traves de su nombre.
const idArticulo = async(NameArticulo:string) : Promise<number | undefined> =>{
    try{
        const idArticulo = await prisma.type_Article.findFirst({
            where:{name:NameArticulo},
            select:{id:true}
        })
        return idArticulo?.id
    }catch(error){
        return undefined
    }
}

// poblamos la bd con los distintos datos.
const poblarBD = async() =>{
    try{
        // poblamos los articulos
        for( let i = 0; i<articulo.length; i++){
            await prisma.type_Article.create({
                data:{
                    name:articulo[i].name
                }
            })
        }
        //poblamos las ligas
        for(let i = 0; i<Liga.length; i++){
            await prisma.liga.create({
                data:{name:Liga[i].name}
            })
        }

        // empezamos a poblar los productos
        console.log(producto.length)
        for(let i=0; i<producto.length; i++){
            
            const idLeague = await idLiga(producto[i].liga) // buscamos la liga del producto dependiendo el nombre. aplicamos la funcion.
            const idArti = await idArticulo(producto[i].articulo) // buscamos el articulo del producto dependiendo el nombre. aplicamos la funcion.
            if(idLeague === undefined || idArti === undefined ) return `no se encontro la liga o articulo de ${producto[i]}`

            // creamos el producto con los datos.
            const productoCreado = await prisma.product.create({
                data:{
                    name:producto[i].name,
                    imageUrl:producto[i].imagenUrl,
                    description:producto[i].description,
                    price:producto[i].price,
                    gender:producto[i].gender as Gender,
                    idLiga: idLeague,
                    idArticle:idArti,
                }
            })
            console.log(productoCreado)
        } 
        
    }catch(error){
        console.log(error)
    }

}



poblarBD()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
