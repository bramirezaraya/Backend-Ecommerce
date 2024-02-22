import { NextFunction } from "express";
import { VerifyToken } from "./Token";
import { Request,Response } from "express";


export const ValidarToken = async(req:Request, res:Response, next:NextFunction) =>{

    try{

        const token = req.header('authorization')

        if(!token) return res.status(404).json({message:'Acesso Denegado.'})
        const tokeVerificado = await VerifyToken(token.split(' ')[1])
        
        if(tokeVerificado){
            //avazamos al siguiente midwlare
            next()
        }else{
            return res.status(404).json({message:'Debe Iniciar Sesión'})
        }

    }catch(error){
        res.status(500).json({message:'Un error ha ocurrido, intentelo nuevamente.'})
    }


}