// @ts-check

const queries = {
  SQL_SEL_WM_OBJECTS: `
  SELECT
    Id,
    Mac,
    IsActivated,
    ActivationCode
  FROM
    WmObjects;
  `,

  SQL_INS_WM_OBJECT: `
  INSERT INTO
    WmObjects (
      Guid,
      Mac,
      Name,
      ActivationCode,
      WmGroupId
    )
  OUTPUT
    INSERTED.Id
  VALUES
    (@Guid, @Mac, @Name, @ActivationCode, @WmGroupId);
  `,

  SQL_INS_WM_RECORD: `
  INSERT INTO
    WmRecords (
      Data,
      WmObjectId
    )
  OUTPUT
    INSERTED.Id
  VALUES
    (@Data, @WmObjectId);
  `,

  SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID: `
  UPDATE 
    WmObjects
  SET
    IsActivated = @IsActivated
  WHERE
    Id = @Id;
  `,
};

module.exports = queries;
