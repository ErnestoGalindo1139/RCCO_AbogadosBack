-- =============================================
-- Autor: Ernesto Galindo
-- Fecha: 04/12/2025
-- Descripción: Lista todos los Usuarios del evento
-- =============================================
CREATE PROCEDURE [dbo].[upL_UsuariosEventos]

	@nb_Nombre		VARCHAR(MAX) = NULL,
	@sn_Pagado		BIT = NULL

AS
BEGIN

	SELECT
		u.id_UsuarioEvento,
		u.nb_Nombre,
		u.nb_ApellidoPaterno,
		u.nb_ApellidoMaterno,
		u.de_Celular,
		u.de_Correo,
		u.nb_Empresa,
		u.de_Comentarios,
		u.fh_Registro,
		u.fh_Pago,
		u.sn_Pagado,
		u.nu_Folio
		u.sn_Activo
	FROM
		UsuariosEvento u WITH (NOLOCK)
	WHERE
		(
			@nb_Nombre IS NULL
			OR u.@nb_Nombre LIKE '%' + @nb_Nombre + '%'
		)
		AND (@sn_Pagado IS NULL OR u.sn_Pagado = @sn_Pagado)
	ORDER BY
		id_UsuarioEvento

END
