
const meses = [
    'Enero', 'Febrero', 'Mars', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default (s) => {
    const d = new Date(s)
    return `${d.getDay()} de ${meses[d.getMonth()]} ${d.getFullYear()}`
}
