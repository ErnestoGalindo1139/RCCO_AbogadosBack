-- Ejecutar en una base de PRUEBAS después de instalar upC_RegistroSimposio.
-- No envía WhatsApp. El ROLLBACK elimina las dos altas de prueba.
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @resultados TABLE (id_UsuarioEvento INT, nu_Folio NVARCHAR(40));
    DECLARE @esperado BIGINT;
    SELECT @esperado = ISNULL(MAX(CASE WHEN nu_Folio LIKE 'SIM27-%'
        THEN TRY_CONVERT(BIGINT, SUBSTRING(nu_Folio, 7, 32)) END), 0) + 1
    FROM dbo.UsuariosEvento WITH (TABLOCKX, HOLDLOCK);

    INSERT INTO @resultados
    EXEC dbo.upC_RegistroSimposio @nb_Nombre = 'PRUEBA', @nb_ApellidoPaterno = 'SP';
    INSERT INTO @resultados
    EXEC dbo.upC_RegistroSimposio @nb_Nombre = 'PRUEBA', @nb_ApellidoPaterno = 'SP';

    IF (SELECT COUNT(*) FROM @resultados) <> 2
        THROW 51001, 'El SP no devolvió ambos registros.', 1;
    IF (SELECT COUNT(DISTINCT nu_Folio) FROM @resultados) <> 2
        THROW 51002, 'Los folios no son únicos.', 1;
    IF (SELECT MIN(TRY_CONVERT(BIGINT, SUBSTRING(nu_Folio, 7, 32))) FROM @resultados) <> @esperado
        THROW 51003, 'Consecutivo inicial incorrecto.', 1;
    IF (SELECT MAX(TRY_CONVERT(BIGINT, SUBSTRING(nu_Folio, 7, 32))) FROM @resultados) <> @esperado + 1
        THROW 51004, 'Los folios no son consecutivos.', 1;
    IF EXISTS (
        SELECT 1 FROM @resultados r JOIN dbo.UsuariosEvento u
            ON u.id_UsuarioEvento = r.id_UsuarioEvento
        WHERE u.nu_Folio <> r.nu_Folio OR u.sn_Pagado <> 0
            OR u.fh_Pago IS NOT NULL OR u.sn_Activo <> 1
    )
        THROW 51005, 'El alta no conserva folio y estado inicial.', 1;
    SELECT * FROM @resultados;
    ROLLBACK TRANSACTION;
    PRINT 'Prueba correcta; altas revertidas.';
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
