


// Traigo axios
const axios = require('axios');
// Traigo express
const { Router } = require('express');
// Traigo mi API
const {API_KEY} = process.env;
// Traigo mis modelos
const {Dog, Temperamento} = require('../db')
// Creo el servidor 
const router = Router();




// Funciones para rutas

const getApiInfo = async () => {
    const apiUrl = await axios.get(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)
    const apiInfo = await apiUrl.data.map(el => {
        return {
            id: el.id,
            name: el.name, 
            altura: el.weight.metric,
            peso: el.height.metric,
            anoDeVida: el.life_span,
            img: el.image.url,
            temperamento: el.temperament ? el.temperament.split(',') : ['Not found'],
            criadoPara: el.bred_for
        }
    })
    return apiInfo
}

const getBaseInfo = async () => {
    return await Dog.findAll({
        include: {
            model: Temperamento,
            attributes: ['name'],
            through: {
                attributes: []
            }
        }
    })
}

const getAllDogs = async () => {
    const apiInfo = await getApiInfo()
    const baseInfo = await getBaseInfo()
    const infoTotal = baseInfo.concat(apiInfo)
    return infoTotal
}

const getDog = async (id) => {
    const total = await getAllDogs()
    for(let i = 0; i < total.length; i++){
        if(total[i].id == id){
            const pepe = total[i]
            return pepe
        }
    }
    const pepa = 0
    return pepa
}

const getTemperamet = async () => {
    const apiUrl = await axios.get(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)
    let pepe = []
    for(var i = 0; i < apiUrl.data.length; i++){
        if(apiUrl.data[i].temperament){
            let obj = apiUrl.data[i].temperament.split(',')
            pepe.push(obj)
            for(let a = 0; a < pepe[i].length; a++){
                Temperamento.findOrCreate({
                    where: {name: pepe[i][a]}
                })
            }
        }else{
            let obj = 'no tiene temperamento'
            pepe.push(obj)
        }
    }
}

// Aca van las rutas
 
router.get('/dogs', async (req, res) => {
    const {name} = req.query
    let total = await getAllDogs()
    if(name){
        let dogsName = total.filter(el => el.name.toLowerCase().includes(name.toLowerCase()))
        if(dogsName.length){
            return res.status(200).send(dogsName)
        }else{
            return res.status(404).send('No se encontro el perro')
        } 
    }  
    return res.status(200).send(total) 
}) 

router.get(`/dogs/:id`, async (req, res) => {
    const {id} = req.params
    const pepe = await getDog(id)
    if(pepe == 0){
        return res.status(404).send('No se encontro la raza')
    } 
    return res.status(200).send(pepe)
}) 

router.get('/temperaments', async (req, res) => {
    await getTemperamet()
    const allTemperament = await Temperamento.findAll()
    return res.status(200).send(allTemperament)
})

router.post('/dogs', async (req, res) => {
    await getTemperamet()
    const {name, altura, peso, anoDeVida, imgBd, temperamento, criadoPara} = req.body
    const createDog = await Dog.create({ name, altura, peso, anoDeVida, imgBd, criadoPara})
    const createTemperament = await Temperamento.findAll({
        where: {name: temperamento}
    })
    createDog.addTemperamento(createTemperament)
    res.send('Personaje creado con exito')
})   
module.exports = router;
