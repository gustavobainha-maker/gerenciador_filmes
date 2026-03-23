import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(express.json());

// 🔌 conexão PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'helpdesk',
  password: '123456',
  port: 5432,
});

// teste de conexão
pool.connect()
  .then(() => console.log('✅ Conectado ao PostgreSQL'))
  .catch(err => console.error('❌ Erro conexão:', err));


// =======================
// 🎬 CRUD FILMES
// =======================

// ➕ Criar filme
app.post('/filmes', async (req, res) => {
  try {
    const { titulo, genero, ano_lancamento, diretor } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: 'Título é obrigatório' });
    }

    const result = await pool.query(
      `INSERT INTO filmes (titulo, genero, ano_lancamento, diretor)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo, genero, ano_lancamento, diretor]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


// 📋 Listar filmes
app.get('/filmes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filmes ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


// ✏️ Atualizar filme
app.put('/filmes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, genero, ano_lancamento, diretor } = req.body;

    const result = await pool.query(
      `UPDATE filmes
       SET titulo = $1,
           genero = $2,
           ano_lancamento = $3,
           diretor = $4
       WHERE id = $5
       RETURNING *`,
      [titulo, genero, ano_lancamento, diretor, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Filme não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


// ❌ Deletar filme
app.delete('/filmes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM filmes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Filme não encontrado' });
    }

    res.json({ mensagem: 'Filme deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


// 🚀 servidor
app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
