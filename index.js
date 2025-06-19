const express = require('express');
const app = express();

const {
    agregar,
    obtenerPorId,
    obtenerTodos,
} = require('./pelicula.repositorio');
const { crearSolicitudPago } = require('./pago.repositorio');

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para depurar el cuerpo de la solicitud
app.use('/api/pagos', (req, res, next) => {
    console.log('Cuerpo de la solicitud recibida:', JSON.stringify(req.body, null, 2));
    next();
});

app.get('/', (req, res) => {
    res.json({ mensaje: 'Hola mundo' });
});

app.get('/api/peliculas', async (req, res) => {
    try {
        const peliculas = await obtenerTodos();
        res.status(200).json(peliculas);
    } catch (error) {
        console.error('Error en /api/peliculas:', error.stack);
        res.status(500).json({ mensaje: 'Error al obtener películas', error: error.message });
    }
});

app.get('/api/peliculas/:id', async (req, res) => {
    try {
        const pelicula = await obtenerPorId(req.params.id);
        if (!pelicula) {
            return res
                .status(404)
                .json({ mensaje: `Película no encontrada con el id: ${req.params.id}` });
        }
        return res.status(200).json(pelicula);
    } catch (error) {
        console.error('Error en /api/peliculas/:id:', error.stack);
        res.status(500).json({ mensaje: 'Error al obtener película', error: error.message });
    }
});

app.post('/api/peliculas', async (req, res) => {
    try {
        const pelicula = {
            title: req.body.title,
            plot: req.body.resumen,
            visto: false,
        };
        const id = await agregar(pelicula);
        pelicula._id = id;
        res.status(201).json(pelicula);
    } catch (error) {
        console.error('Error en /api/peliculas POST:', error.stack);
        res.status(500).json({ mensaje: 'Error al agregar película', error: error.message });
    }
});

app.post('/api/pagos', async (req, res) => {
    try {
        // Validar que req.body no esté vacío
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                mensaje: 'El cuerpo de la solicitud está vacío o mal formado',
                error: 'No se proporcionó un cuerpo JSON válido'
            });
        }

        const datosPago = {
           body:req.body,
           headers:req.headers,
           query:req.query,
           Fecha_Registro: new Date()
        };

        const pago = await crearSolicitudPago(datosPago);
        res.status(201).json(pago);
    } catch (error) {
        console.error('Error en /api/pagos:', error.stack);
        res.status(500).json({
            mensaje: 'Error al crear solicitud de pago',
            error: error.message || 'Error desconocido'
        });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});