// @ts-check

const queries = {
  SQL_SEL_WM_OBJECTS: `
  SELECT
    Id,
    Mac,
    Name,
    Latitude,
    Longitude
  FROM
    WmObjects;
  `,

  SQL_INS_WM_RECORD: `
  INSERT INTO
    WmRecords (
      Data,
      WmObjectId,
      CreatedAt
    )
  OUTPUT
    INSERTED.Id
  VALUES
    (@Data, @WmObjectId, @CreatedAt);
  `,
};

module.exports = queries;
