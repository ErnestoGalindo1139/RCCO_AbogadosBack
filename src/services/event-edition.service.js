export const visibleEventComments = (value) =>
  String(value ?? '')
    .replace(
      /\s*\[WhatsApp: autoriza[^\]\r\n]*; \d{4}-\d{2}-\d{2}T[^\]\r\n]+\]/g,
      ''
    )
    .trim();

// Use event metadata first; never infer the event year from the registration date.
export const withEventEdition = (row) => {
  const folio = String(row.nu_Folio || '');
  const legacy = /^PLD-2026-/.test(folio);
  const second = /^SIM27-/.test(folio);
  return {
    ...row,
    nu_AnioEvento: row.nu_AnioEvento ?? (legacy ? 2026 : second ? 2027 : null),
    nu_EdicionEvento: row.nu_EdicionEvento ?? (legacy ? 1 : second ? 2 : null),
  };
};
const norm = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
export const filterEventRows = (rows, filters = {}) =>
  rows.map(withEventEdition).filter(
    (row) =>
      (filters.nu_AnioEvento == null ||
        String(row.nu_AnioEvento) === String(filters.nu_AnioEvento)) &&
      (filters.nu_EdicionEvento == null ||
        String(row.nu_EdicionEvento) === String(filters.nu_EdicionEvento)) &&
      (!filters.query ||
        [row.nb_Nombre, row.nb_ApellidoPaterno, row.nb_ApellidoMaterno]
          .join(' ')
          .concat(
            ' ',
            row.de_Correo || '',
            ' ',
            row.de_Celular || '',
            ' ',
            row.nb_Empresa || '',
            ' ',
            row.nu_Folio || '',
            ' ',
            visibleEventComments(row.de_Comentarios)
          )
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .includes(norm(filters.query)))
  );
