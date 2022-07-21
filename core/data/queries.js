// @ts-check

//#region Imports

// Core - Data
import common from './common';

//#endregion

const queries = {
  SQL_SEL_WM_OBJECTS: `
  SELECT
    Id,
    Mac,
    IsActivated,
    ActivationCode,
    Settings
  FROM
    ${common.DB_TABLES.WM_OBJECTS};
  `,

  SQL_INS_WM_OBJECT: `
  INSERT INTO
    ${common.DB_TABLES.WM_OBJECTS} (
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
    ${common.DB_TABLES.WM_RECORDS} (
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
    ${common.DB_TABLES.WM_OBJECTS}
  SET
    IsActivated = @IsActivated
  WHERE
    Id = @Id;
  `,
};

export default queries;
