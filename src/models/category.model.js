import { Model, DataTypes } from 'sequelize';

class Category extends Model {
	static associate(models) {
		this.hasMany(models.RouteContent, { foreignKey: 'category_id' }); // Nueva relación con RouteContent
		this.hasMany(models.Subcategory, { foreignKey: 'category_id' });
		this.belongsTo(models.Service, { foreignKey: 'category_id' });
		// this.belongsTo(models.Product, { foreignKey: 'category_id' });
	}
}

const initializeCategory = (sequelize) => {
	Category.init({
		category_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true
		},
		owner_id: {
			type: DataTypes.UUID,
			allowNull: false // Relación con el usuario creador
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		entity_type: {
			type: DataTypes.ENUM('service', 'product', 'content'), // Agregamos 'content'
			allowNull: false
		}
	}, {
		sequelize,
		tableName: 'category',
		modelName: 'Category',
		timestamps: false
	});

	return Category;
};

export default initializeCategory;
