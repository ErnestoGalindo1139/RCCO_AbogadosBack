-- ====================================================================
-- Autor: Ernesto Galindo
-- Fecha: 14/01/2026
-- Descripción: Actualiza los datos de un UsuarioEvento
-- ====================================================================
ALTER PROCEDURE [dbo].[upU_UsuariosEvento]
	@id_UsuarioEvento			INT,
	@nb_Nombre					VARCHAR(200),
	@nb_ApellidoPaterno			VARCHAR(200),
	@nb_ApellidoMaterno			VARCHAR(200) = NULL,
	@nb_Empresa					VARCHAR(200) = NULL,
	@de_Celular					VARCHAR(20) = NULL,
	@de_Correo					VARCHAR(200) = NULL,
	@de_Comentarios				VARCHAR(500) = NULL,
	@sn_UsuarioEspecial			BIT = NULL,
	@nb_TipoUsuarioEspecial		VARCHAR(200) = NULL

AS
BEGIN
	SET NOCOUNT ON

	BEGIN TRY
		BEGIN TRANSACTION

		-- ⚠️ 1️⃣ Validaciones básicas
		IF @id_UsuarioEvento IS NULL OR @id_UsuarioEvento = 0
		BEGIN
			RAISERROR('El id del UsuarioEvento es obligatorio.', 16, 1);
			ROLLBACK TRANSACTION
			RETURN
		END

		IF @nb_Nombre IS NULL OR LTRIM(RTRIM(@nb_Nombre)) = ''
		BEGIN
			RAISERROR('El nombre es obligatorio.', 16, 1);
			ROLLBACK TRANSACTION
			RETURN
		END

		IF @nb_ApellidoPaterno IS NULL OR LTRIM(RTRIM(@nb_ApellidoPaterno)) = ''
		BEGIN
			RAISERROR('El apellido paterno es obligatorio.', 16, 1);
			ROLLBACK TRANSACTION
			RETURN
		END

		-- ⚠️ 2️⃣ Verificar existencia
		IF NOT EXISTS (
			SELECT 1
			FROM UsuariosEvento
			WHERE id_UsuarioEvento = @id_UsuarioEvento
		)
		BEGIN
			RAISERROR('El UsuarioEvento no existe.', 16, 1);
			ROLLBACK TRANSACTION
			RETURN
		END

		-- ✏️ 3️⃣ Actualizar datos
		UPDATE UsuariosEvento
		SET
			nb_Nombre = @nb_Nombre,
			nb_ApellidoPaterno = @nb_ApellidoPaterno,
			nb_ApellidoMaterno = @nb_ApellidoMaterno,
			nb_Empresa = @nb_Empresa,
			de_Celular = @de_Celular,
			de_Correo = @de_Correo,
			de_Comentarios = @de_Comentarios,
			sn_UsuarioEspecial = @sn_UsuarioEspecial,
			nb_TipoUsuarioEspecial = @nb_TipoUsuarioEspecial
		WHERE
			id_UsuarioEvento = @id_UsuarioEvento

		-- ⚠️ 4️⃣ Validar cambios
		IF @@ROWCOUNT = 0
		BEGIN
			RAISERROR('No se realizaron cambios en el UsuarioEvento.', 16, 1);
			ROLLBACK TRANSACTION
			RETURN
		END

		COMMIT TRANSACTION;

		-- ✅ Resultado final
		SELECT
			1 AS success,
			'Usuario actualizado correctamente.' AS message,
			@id_UsuarioEvento AS id_UsuarioEvento

	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION;

		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
		RAISERROR(@ErrorMessage, 16, 1)
	END CATCH
END
