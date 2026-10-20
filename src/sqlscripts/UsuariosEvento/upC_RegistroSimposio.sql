-- Registro del simposio 2027: genera ID y folio y guarda en una sola transacción.
-- Ejecutar en la misma base de datos utilizada por el backend antes de desplegarlo.
CREATE OR ALTER PROCEDURE dbo.upC_RegistroSimposio
    @nb_Nombre VARCHAR(200),
    @nb_ApellidoPaterno VARCHAR(200),
    @nb_ApellidoMaterno VARCHAR(200) = NULL,
    @de_Celular VARCHAR(20) = NULL,
    @de_Correo NVARCHAR(200) = NULL,
    @nb_Empresa VARCHAR(200) = NULL,
    @de_Comentarios VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NULLIF(LTRIM(RTRIM(@nb_Nombre)), '') IS NULL
        THROW 50001, 'El nombre es obligatorio.', 1;
    IF NULLIF(LTRIM(RTRIM(@nb_ApellidoPaterno)), '') IS NULL
        THROW 50002, 'El apellido paterno es obligatorio.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @id_UsuarioEvento INT;
        DECLARE @consecutivo BIGINT;
        DECLARE @nu_Folio NVARCHAR(40);

        -- El bloqueo dura hasta COMMIT. Incluye inactivos y evita que dos altas
        -- calculen simultáneamente el mismo ID o folio.
        SELECT
            @id_UsuarioEvento = ISNULL(MAX(id_UsuarioEvento), 0) + 1,
            @consecutivo = ISNULL(MAX(CASE
                WHEN nu_Folio LIKE 'SIM27-%'
                THEN TRY_CONVERT(BIGINT, SUBSTRING(nu_Folio, 7, 32))
            END), 0) + 1
        FROM dbo.UsuariosEvento WITH (TABLOCKX, HOLDLOCK);

        -- Cuatro dígitos como mínimo; nunca truncar si se supera 9999.
        SET @nu_Folio = N'SIM27-' + CASE
            WHEN @consecutivo < 10000
                THEN RIGHT('0000' + CONVERT(VARCHAR(20), @consecutivo), 4)
            ELSE CONVERT(VARCHAR(20), @consecutivo)
        END;

        INSERT INTO dbo.UsuariosEvento (
            id_UsuarioEvento, nb_Nombre, nb_ApellidoPaterno, nb_ApellidoMaterno,
            de_Celular, de_Correo, nb_Empresa, de_Comentarios,
            fh_Registro, fh_Pago, sn_Pagado, nu_Folio, sn_Activo
        ) VALUES (
            @id_UsuarioEvento, @nb_Nombre, @nb_ApellidoPaterno, @nb_ApellidoMaterno,
            @de_Celular, @de_Correo, @nb_Empresa, @de_Comentarios,
            GETDATE(), NULL, 0, @nu_Folio, 1
        );

        COMMIT TRANSACTION;

        SELECT @id_UsuarioEvento AS id_UsuarioEvento, @nu_Folio AS nu_Folio;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
