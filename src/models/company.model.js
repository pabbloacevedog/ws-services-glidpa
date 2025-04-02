import { Model, DataTypes } from 'sequelize';

class Company extends Model {
	static associate(models) {
		this.hasMany(models.Milestone, { foreignKey: 'company_id' });
		this.hasMany(models.Award, { foreignKey: 'company_id' });
		this.hasMany(models.AboutUsStatement, { foreignKey: 'company_id' });
		this.hasMany(models.Location, { foreignKey: 'company_id' });
	}
}

const initializeCompany = (sequelize) => {
	Company.init({
		company_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		company_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		company_description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		date_founded: {
			type: DataTypes.DATE,
			allowNull: true
		},
		number_of_employees: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		company_history: {
			type: DataTypes.TEXT,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: '`company`',
		modelName: 'Company',
		timestamps: false,
	});

	return Company;
};

export default initializeCompany;
