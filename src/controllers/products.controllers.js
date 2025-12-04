import { getConnection } from '../database/connection.js';
import sql from 'mssql';

export const getProductos = async (req, res) => {
  const pool = await getConnection();

  const result = await pool.request().query('SELECT * FROM Productos');

  // res.send('obteniendo productos')
  res.json(result.recordset);
};

export const getProductoById = async (req, res) => {
  console.log(req.params.id);

  const pool = await getConnection();
  const result = await pool
    .request()
    .input('id', sql.Int, req.params.id)
    .query('SELECT * FROM Productos WHERE ProductoID = @id');

  console.log(result);

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json(result.recordset[0]);
};

export const createProducto = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input('Nombre', sql.VarChar, req.body.Nombre)
    .input('Descripcion', sql.VarChar, req.body.Descripcion)
    .input('Precio', sql.Decimal, req.body.Precio)
    .input('Cantidad', sql.Int, req.body.Cantidad)
    .query(
      'INSERT INTO Productos (Nombre, Descripcion, Precio, Cantidad) VALUES (@Nombre, @Descripcion, @Precio, @Cantidad); SELECT SCOPE_IDENTITY() AS id;'
    );

  console.log(result);

  res.json({
    id: result.recordset[0].id,
    Nombre: req.body.Nombre,
    Descripcion: req.body.Descripcion,
    Precio: req.body.Precio,
    Cantidad: req.body.Cantidad,
  });
};

export const updateProducto = async (req, res) => {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input('id', sql.Int, req.params.id)
    .input('Nombre', sql.VarChar, req.body.Nombre)
    .input('Descripcion', sql.VarChar, req.body.Descripcion)
    .input('Precio', sql.Decimal, req.body.Precio)
    .input('Cantidad', sql.Int, req.body.Cantidad)
    .query(
      'UPDATE Productos SET Nombre = @Nombre, Descripcion = @Descripcion, Precio = @Precio, Cantidad = @Cantidad WHERE ProductoID = @id'
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({
    id: req.params.id,
    Nombre: req.body.Nombre,
    Descripcion: req.body.Descripcion,
    Precio: req.body.Precio,
    Cantidad: req.body.Cantidad,
  });
};

export const deleteProducto = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input('id', sql.Int, req.params.id)
    .query('DELETE FROM Productos WHERE ProductoID = @id');

  console.log(result);

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json({ message: 'Product deleted' });
};
