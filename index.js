const cors = require('cors');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, Task } = require('./models');
const authMiddleware = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

// ======================
// HEALTH
// ======================
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'SGT API funcionando' });
});

// ======================
// AUTH
// ======================

// POST /auth/register
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email: email || null,
      password: hashedPassword
    });

    return res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (e) {
    // username unique
    return res.status(400).json({ error: 'No se pudo crear el usuario (¿ya existe?)' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ error: 'Debes enviar username o email, y password' });
    }

    const where = username ? { username } : { email };
    const user = await User.findOne({ where });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });

    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'Error interno en login' });
  }
});

// ======================
// TAREAS (OBLIGATORIO)
// Todas autenticadas y con ownership por userId
// ======================

// POST /tareas
app.post('/tareas', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    if (!title) return res.status(400).json({ error: 'title es requerido' });

    // status opcional, pero si viene, validar
    const allowed = ['pendiente', 'en_progreso', 'completada'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: `status inválido. Usa: ${allowed.join(', ')}` });
    }

    const task = await Task.create({
      title,
      description: description || null,
      dueDate: dueDate || null,
      status: status || 'pendiente',
      userId: req.userId
    });

    return res.status(201).json(task);
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo crear la tarea' });
  }
});

// GET /tareas
app.get('/tareas', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.userId },
      order: [['id', 'DESC']]
    });

    return res.json(tasks);
  } catch (e) {
    return res.status(500).json({ error: 'No se pudieron obtener las tareas' });
  }
});

// GET /tareas/:id
app.get('/tareas/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    return res.json(task);
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener la tarea' });
  }
});

// PUT /tareas/:id
app.put('/tareas/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const allowed = ['pendiente', 'en_progreso', 'completada'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: `status inválido. Usa: ${allowed.join(', ')}` });
    }

    await task.update({
      title: title ?? task.title,
      description: description ?? task.description,
      dueDate: dueDate ?? task.dueDate,
      status: status ?? task.status
    });

    return res.json(task);
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo actualizar la tarea' });
  }
});

// DELETE /tareas/:id
app.delete('/tareas/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    await task.destroy();
    return res.json({ message: 'Tarea eliminada' });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo eliminar la tarea' });
  }
});

// ======================
// SERVER
// ======================
(async () => {
  try {
    // Para hoy y por velocidad: alter ajusta columnas en SQLite sin migraciones manuales
    await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
