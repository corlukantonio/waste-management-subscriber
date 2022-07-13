const queries = {
  SQL_SEL_WM_OBJECTS: `
  SELECT
    Id,
    Mac,
    Name,
    Latitude,
    Longitude
  FROM
    WmObjects`,
};

module.exports = queries;
