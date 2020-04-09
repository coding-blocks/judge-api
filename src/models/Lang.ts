import Sequelize from "sequelize";

export type LangsAttributes = { 
  lang_slug: string, 
  lang_name:string, 
  lang_version: string 
}

export type LangInstance = Sequelize.Instance<LangsAttributes> & LangsAttributes

export const define = (
  db: Sequelize.Sequelize
): Sequelize.Model<LangInstance, LangsAttributes> => {
  return db.define('langs', {
    lang_slug: {
      type: Sequelize.STRING(10),
      primaryKey: true
    },
    lang_name: Sequelize.STRING(10),
    lang_version: Sequelize.STRING(5)
  }, {
    timestamps: false
  })
}

export const associate = () => {};
