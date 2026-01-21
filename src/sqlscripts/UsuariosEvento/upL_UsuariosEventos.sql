-- =============================================
-- Autor: Ernesto Galindo
-- Fecha: 04/12/2025
-- Descripción: Lista todos los Usuarios del evento
-- =============================================
ALTER PROCEDURE [dbo].[upL_UsuariosEvento]

	@sn_Activo		BIT = NULL

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
		u.nu_Folio,
		u.sn_Activo,
		sn_UsuarioEspecial,
		nb_TipoUsuarioEspecial
	FROM
		UsuariosEvento u WITH (NOLOCK)
	WHERE
		u.sn_Activo = 1
	ORDER BY
		id_UsuarioEvento

END
