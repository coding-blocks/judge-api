import Sequelize from "sequelize";

export type Testcase = {
  id: number,
  score: number,
  time: string,
  result: string
}

export type SubmissionAttributes = {
  id?: number
  lang: string
  start_time: Date
  end_time?: Date
  mode: string
  results?: Array<Testcase>
  outputs?: Array<string>
  callback?: string
}

export type SubmissionInstance = Sequelize.Instance<SubmissionAttributes> & SubmissionAttributes

export const define = (
  db: Sequelize.Sequelize
): Sequelize.Model<SubmissionInstance, SubmissionAttributes> => {
  return db.define('submissions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    lang: {
      type: Sequelize.STRING(10)
    },
    start_time: Sequelize.DATE,
    end_time: Sequelize.DATE,
    mode: {
      type: Sequelize.STRING,
      allowNull: false
    },
    results: Sequelize.JSON,
    outputs: Sequelize.ARRAY(Sequelize.STRING),
    callback: Sequelize.STRING
  }, {
    paranoid: true, // We do not want to lose any submission data
    timestamps: false // Start and end times are already logged
  })
}

export const associate = ({ langs, submissions }) => {
  submissions.belongsTo(langs, {
    foreignKey: 'lang',
    otherKey: 'lang_slug'
  })
};
