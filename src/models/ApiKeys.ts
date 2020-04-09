import Sequelize from "sequelize";

export type ApiKeyAttrs  = {
  id: number,
  key: string,
  whitelist_domains: string[] | undefined
  whitelist_ips: string[] | undefined
}

export type ApiKeyInstance = Sequelize.Instance<ApiKeyAttrs> & ApiKeyAttrs

export const define = (
  db: Sequelize.Sequelize
): Sequelize.Model<ApiKeyInstance, ApiKeyAttrs> => {
  return db.define('apikeys', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: Sequelize.STRING(32),
      unique: true,
      allowNull: false
    },
    whitelist_domains: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    whitelist_ips: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    }
  })
}

export const associate = ({ langs, submissions }) => {
  submissions.belongsTo(langs, {
    foreignKey: 'lang',
    otherKey: 'lang_slug'
  })
};
