import { Model, DataTypes } from 'sequelize';

class ServiceType extends Model {
	static associate(models) {
		this.hasMany(models.Service, { foreignKey: 'service_type_id' });
	}
}

const initializeServiceType = (sequelize) => {
	ServiceType.init({
		service_type_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		title: {
			type: DataTypes.STRING,
			allowNull: true
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		icon: {
			type: DataTypes.STRING,
			allowNull: true
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	}, {
		sequelize,
		tableName: 'service_type',
		modelName: 'ServiceType',
		timestamps: true
	});

	return ServiceType;
};

export default initializeServiceType;