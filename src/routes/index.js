const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const axios = require('axios');
const e = require('express');
const {
    API_KEY
  } = process.env;
const {Dog, Temperamento} = require('../db')

const router = Router();
// router.use(json())


// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
const getApiInfo = async () => {
    const apiUrl = await axios.get(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)
    const apiInfo = await apiUrl.data.map(el => {
        return {
            id: el.id,
            name: el.name, 
            altura: el.weight.metric,
            peso: el.height.metric,
            anoDeVida: el.life_span,
            img: el.reference_image_id,
            temperamento: el.temperament,
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
    const infoTotal = apiInfo.concat(baseInfo)
    return infoTotal
}

// Aca van las rutas

router.get('/dogs', async (req, res) => {
    const {name} = req.query
    let total = await getAllDogs()
    if(name){
        let dogsName = total.filter(el => el.name.toLowerCase().includes(name.toLowerCase()))
        console.log(dogsName)
        if(dogsName.length){
            return res.status(200).send(dogsName)
        }else{
            return res.status(404).send('No se encontro el perro')
        } 
    } 
    return res.status(200).send(total) 
})
 
 

module.exports = router;
