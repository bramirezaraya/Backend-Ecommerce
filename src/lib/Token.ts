import jwt, {JwtPayload} from "jsonwebtoken";

// función para generar el token, se envian tres parametros para crearlo, los datos del usuario para hacer match.
// la clave secreta que esta almacenada en el .env.
// y la expiracioin del token.
export const GenerateToken = (id:number, name:string) =>{
    return jwt.sign(
        {
            id:id, 
            name:name
        },
        process.env.CLAVE_SECRETA || 'tokenUndefined',
        {
            expiresIn:'1h'
        }
    )
}

// función para verificar si el token realmente fue creado por nosotros.
export const VerifyToken = async(token:any) :Promise<JwtPayload | null > =>{
    try{
        return jwt.verify(token, process.env.CLAVE_SECRETA || "tokenUndefined") as JwtPayload
    }catch(error){
        return null
    }
}