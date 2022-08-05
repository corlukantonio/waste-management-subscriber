// @ts-check

//#region Imports

// Core - Data
const common = require('./common');

//#endregion

const queries = {
  SQL_EXEC_WM_TRIGGER_WASTE_BIN_EMPTYING: `
  DECLARE @returnValue INT
  EXEC @returnValue = WmTriggerWasteBinEmptying
  SELECT 'Return Value' = @returnValue;
  `,

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

  SQL_SEL_WM_OBJECTS_WASTE_BIN_FOR_EMPTYING: `
  SELECT
    Id,
    WmObjectId
  FROM
    ${common.DB_TABLES.WM_OBJECTS_WASTE_BIN_FOR_EMPTYING};
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

  SQL_INS_WM_OBJECT_WASTE_BIN_FOR_EMPTYING: `
  INSERT INTO
    ${common.DB_TABLES.WM_OBJECTS_WASTE_BIN_FOR_EMPTYING} (
      WmObjectId
    )
  OUTPUT
    INSERTED.Id
  VALUES
    (@WmObjectId);
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

  SQL_UPD_WM_OBJECT_SETTINGS_BY_ID: `
  UPDATE
    ${common.DB_TABLES.WM_OBJECTS}
  SET
    Settings = @Settings
  WHERE
    Id = @Id;
  `,
};

module.exports = queries;
