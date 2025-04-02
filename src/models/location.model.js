import { Model, DataTypes } from 'sequelize';

class Location extends Model {
	static associate(models) {
		this.belongsTo(models.Company, { foreignKey: 'company_id' });
		this.hasMany(models.ContactCompany, { foreignKey: 'location_id' });
		this.hasMany(models.Schedule, { foreignKey: 'location_id' });
		this.hasMany(models.SocialNetworkCompany, { foreignKey: 'location_id' });
	}
}

const initializeLocation = (sequelize) => {
	Location.init({
		location_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false
		},
		company_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		type: {
			type: DataTypes.ENUM(
				'main_office',      // Sede principal física
				'branch',           // Sucursal física estándar
				'clinic',           // Clínicas médicas/veterinarias
				'studio',           // Estudios de belleza/danza
				'gym',              // Gimnasios y centros deportivos
				'salon',            // Salones de belleza/barberías
				'treatment_room',   // Salas de tratamiento (spa)
				'online',           // Servicio 100% digital
				'home_service',     // Atención a domicilio
				'popup'             // Punto temporal en eventos
			),
			allowNull: false,
			defaultValue: 'branch'
		},
		address: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				physicalLocationRequired() {
					if (this.type !== 'online' && !this.address) {
						throw new Error('La dirección es requerida para ubicaciones físicas');
					}
				}
			}
		},
		city: {
			type: DataTypes.STRING,
			allowNull: true
		},
		country: {
			type: DataTypes.STRING,
			allowNull: true
		},
		service_radius: {
			type: DataTypes.STRING,
			allowNull: true,
			comment: 'Ej: "Región Metropolitana", "Zona Norte"'
		},
		link_google_maps: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Detalles específicos de la ubicación'
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		is_primary: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		sequelize,
		tableName: 'location',
		modelName: 'Location',
		timestamps: false,
		hooks: {
			beforeValidate: (location) => {
				// Validar tipos móviles
				if (['home_service', 'popup'].includes(location.type)) {
					if (!location.service_radius) {
						throw new Error('Debe especificar el radio de servicio');
					}
				}
			}
		}
	});

	return Location;
};

export default initializeLocation;