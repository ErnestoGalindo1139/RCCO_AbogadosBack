-- =============================================
-- Autor: Ernesto Galindo
-- Fecha: 04/12/2025
-- Descripción: Actualizar pago de los Usuarios del evento
-- =============================================
CREATE PROCEDURE [dbo].[upU_UsuariosEvento_ActivarDesactivarPago]
  @id_UsuarioEvento		INT,
  @sn_Pagado			BIT

AS
BEGIN
  SET NOCOUNT ON

  BEGIN TRY
    BEGIN TRANSACTION

    -- 🧩 1️⃣ Validar existencia
    IF NOT EXISTS (SELECT 1 FROM UsuariosEvento WHERE id_UsuarioEvento = @id_UsuarioEvento)
    BEGIN
      RAISERROR('El usuario especificado no existe.', 16, 1)
      ROLLBACK TRANSACTION
      RETURN
    END

    -- 🧮 2️⃣ Calcular nuevo estado
    DECLARE @nuevoEstado INT = CASE WHEN @sn_Pagado = 1 THEN 0 ELSE 1 END

    -- 🧱 3️⃣ Actualizar registro
    UPDATE
		UsuariosEvento
    SET
		sn_Pagado = @nuevoEstado
    WHERE
		id_UsuarioEvento = @id_UsuarioEvento

    COMMIT TRANSACTION

    -- 🧠 5️⃣ Mensaje dinámico
    IF @nuevoEstado = 0
      SELECT 1 AS success, 'Estatus de pago actualizado correctamente.' AS message
    ELSE
      SELECT 1 AS success, 'Estatus de pago actualizado correctamente.' AS message

  END TRY

  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrorMessage, 16, 1);
  END CATCH;
END;
