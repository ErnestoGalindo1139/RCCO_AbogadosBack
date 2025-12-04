-- ====================================================================
-- Autor: Ernesto Galindo
-- Fecha: 04/12/2025
-- Descripción: Inserta un registro en la tabla de UsuariosEvento
-- ====================================================================
CREATE PROCEDURE [dbo].[upC_UsuariosEvento]
	@nb_Nombre				VARCHAR(200),
	@nb_ApellidoPaterno		VARCHAR(200),
	@nb_ApellidoMaterno		VARCHAR(200) = NULL,
	@de_Celular				VARCHAR(20) = NULL,
	@de_Correo				VARCHAR(200) = NULL,
	@nb_Empresa				VARCHAR(200) = NULL,
	@de_Comentarios			VARCHAR(500) = NULL,
	@fh_Pago				DATETIME = NULL,
	@sn_Pagado				BIT	= NULL,
	@nu_Folio				NVARCHAR(MAX),
	@sn_Activo				BIT

AS
BEGIN
	SET NOCOUNT ON

	BEGIN TRY
		BEGIN TRANSACTION

		DECLARE @id_UsuarioEvento INT

		-- 🧮 1️⃣ Obtener el siguiente id disponible
		SELECT
			@id_UsuarioEvento = ISNULL(MAX(id_UsuarioEvento), 0) + 1
		FROM
			UsuariosEvento

		-- ⚠️ 2️⃣ Validaciones básicas
		IF @nb_Nombre IS NULL OR @nb_Nombre = ''
		BEGIN
			RAISERROR('El nombre es obligatorio.', 16, 1);
			ROLLBACK TRANSACTION
			RETURN
		END

		-- 🧱 3️⃣ Insertar usuario
		INSERT INTO UsuariosEvento
		(
			id_UsuarioEvento,
			nb_Nombre,
			nb_ApellidoPaterno,
			nb_ApellidoMaterno,
			de_Celular,
			de_Correo,
			nb_Empresa,
			de_Comentarios,
			fh_Registro,
			fh_Pago,
			sn_Pagado,
			nu_Folio,
			sn_Activo
		)
		VALUES
		(
			@id_UsuarioEvento,
			@nb_Nombre,
			@nb_ApellidoPaterno,
			@nb_ApellidoMaterno,
			@de_Celular,
			@de_Correo,
			@nb_Empresa,
			@de_Comentarios,
			GETDATE(),
			@fh_Pago,
			@sn_Pagado,
			@nu_Folio,
			@sn_Activo
		)


		COMMIT TRANSACTION;

		-- ✅ Resultado final
		SELECT
		  1 AS success,
		  CONCAT('Usuario "', @nb_Nombre, '" registrado correctamente.') AS message,
		  @id_UsuarioEvento AS id_UsuarioEvento

	END TRY

	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION;

		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
		RAISERROR(@ErrorMessage, 16, 1)
	END CATCH
END
