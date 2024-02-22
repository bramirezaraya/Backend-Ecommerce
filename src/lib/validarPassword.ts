export function validarPassword(cadena:any) {

    if(cadena.length >= 7 && cadena.length <= 15){
        // Expresión regular que permite solo letras (mayúsculas o minúsculas y numeros)
        const regex = /^[a-zA-Z0-9]+$/;
        // Comprobación de la cadena contra la expresión regular
        //retornara true o false
        return regex.test(cadena);
    }
    return false
  }