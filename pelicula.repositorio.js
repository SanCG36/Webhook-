require('dotenv').config();
const { MongoClient } = require('mongodb');
const Openpay = require('openpay');

// Configuración de Openpay
const openpay = new Openpay(
    process.env.OPENPAY_MERCHANT_ID,
    process.env.OPENPAY_PRIVATE_KEY,
    process.env.OPENPAY_SANDBOX === 'true'
);

// Configuración de MongoDB
const url = process.env.MONGODB_URL;
const baseDeDatos = 'sample_mflix';
const coleccion = 'pagos';

async function conectarAlaDbAsync() {
    console.log('Conectando a:', url);
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(baseDeDatos);
    const dbCollection = db.collection(coleccion);
    return { client, dbCollection };
}

async function crearSolicitudPago(datosPago) {
    const { client, dbCollection } = await conectarAlaDbAsync();
    try {
       
        const resultado = await dbCollection.insertOne(datosPago);
        return { datosPago, _id: resultado.insertedId };
    }catch(error){
        console.error('Error al crear solicitud de pago:', error);
    } finally {
        await client.close();
    }
}

module.exports = {
    crearSolicitudPago,
};