import { Model, DataTypes } from 'sequelize';

class Service extends Model {
	static associate(models) {
		this.belongsTo(models.Company, { foreignKey: 'company_id' });
		this.belongsToMany(models.User, { through: models.ServiceAssignment, foreignKey: 'service_id' });
		this.belongsTo(models.Category, { foreignKey: 'category_id' }); // Cambiar a `User`
		this.belongsTo(models.ServiceType, { foreignKey: 'service_type_id' });
	}
}

const initializeService = (sequelize) => {
	Service.init({
		service_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		company_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		category_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		service_type_id: {
			type: DataTypes.UUID,
			allowNull: true
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		slogan: {
			type: DataTypes.STRING,
			allowNull: true
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: false
		},
		free_service: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		duration: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		time_frame: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0,
			comment: 'Tiempo adicional para preparación/limpieza en minutos'
		},
		time_frame_description: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Descripción del tiempo adicional (ej: "15min para limpieza")'
		},
		availability: {
			type: DataTypes.STRING,
			allowNull: true
		},
		image_src: {
			type: DataTypes.STRING, // Usar JSON para almacenar múltiples imágenes
			allowNull: true
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		owner_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
	}, {
		sequelize,
		tableName: 'service',
		modelName: 'Service',
		timestamps: true
	});

	return Service;
};

export default initializeService;
