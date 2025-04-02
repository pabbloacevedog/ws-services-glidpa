import { Model, DataTypes } from 'sequelize';

class Faq extends Model {
	static associate(models) {
		this.belongsTo(models.Company, { foreignKey: 'company_id' });
	}
}

const initializeFaq = (sequelize) => {
	Faq.init({
		faq_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		company_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: 'company',
				key: 'company_id'
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		},
		question: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		answer: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		owner_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	}, {
		sequelize,
		tableName: 'faq',
		modelName: 'Faq',
		timestamps: true, // Habilitar timestamps
		indexes: [
			{
				fields: ['company_id']
			},
			{
				// Definir la longitud del prefijo para 'question'
				fields: [
					{
						attribute: 'question',
						length: 255 // Ajusta esta longitud según tus necesidades
					}
				],
				name: 'faq_question_index' // Nombre opcional del índice
			}
		]
	});

	return Faq;
};

export default initializeFaq;
