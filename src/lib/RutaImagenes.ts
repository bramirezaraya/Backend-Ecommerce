
export const rutasImagenes = (ruta:any, name:string) =>{

    if(!ruta){
        return 'Ruta no encontrada.'
    }

    let i
    let arrayRutas = []

    const nombre = name.toLocaleLowerCase().split(' ')
    for (i =1; i<=5; i++){
        const rutaCompleta = `${ruta}${nombre[0]}${i}.jpg`;
        arrayRutas.push(rutaCompleta);
    }
    return arrayRutas
}

export const PrimeraImagen = (ruta:any, name:string) =>{
    if(!ruta) return 'No se ha encontrado la ruta'
    const nombre = name.toLocaleLowerCase().split(' ')
    return `${ruta}${nombre[0]}1.jpg`
}

