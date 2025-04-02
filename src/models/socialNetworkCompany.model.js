import { Model, DataTypes } from 'sequelize';

class SocialNetworkCompany extends Model {
	static associate(models) {
		this.belongsTo(models.Location, { foreignKey: 'location_id' });
	}
}

const initializeSocialNetworkCompany = (sequelize) => {
	SocialNetworkCompany.init({
		social_network_company_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		location_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		whatsapp: {
			type: DataTypes.STRING,
			allowNull: true
		},
		linkedin: {
			type: DataTypes.STRING,
			allowNull: true
		},
		twitter: {
			type: DataTypes.STRING,
			allowNull: true
		},
		instagram: {
			type: DataTypes.STRING,
			allowNull: true
		},
		facebook: {
			type: DataTypes.STRING,
			allowNull: true
		},
		tik_tok: {
			type: DataTypes.STRING,
			allowNull: true
		},
		youtube: {
			type: DataTypes.STRING,
			allowNull: true
		},
		github: {
			type: DataTypes.STRING,
			allowNull: true
		},
		twich: {
			type: DataTypes.STRING,
			allowNull: true
		},
		telegram: {
			type: DataTypes.STRING,
			allowNull: true
		},
		discord: {
			type: DataTypes.STRING,
			allowNull: true
		},
		reddit: {
			type: DataTypes.STRING,
			allowNull: true
		},
		pinterest: {
			type: DataTypes.STRING,
			allowNull: true
		},
		snapchat: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'social_network_company',
		modelName: 'SocialNetworkCompany',
		timestamps: false,
	});

	return SocialNetworkCompany;
};

export default initializeSocialNetworkCompany;
