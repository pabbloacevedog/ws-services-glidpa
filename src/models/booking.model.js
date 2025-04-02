import { Model, DataTypes } from 'sequelize';

class Booking extends Model {
	static associate(models) {
		this.belongsTo(models.Service, { foreignKey: 'service_id' });
		this.belongsTo(models.User, { foreignKey: 'client_id', as: 'Client' }); // Cliente que solicita la reserva
		this.belongsTo(models.User, { foreignKey: 'employee_id', as: 'Employee' }); // Empleado que ejecuta el servicio
		this.belongsTo(models.Location, { foreignKey: 'location_id' });
	}
}

const initializeBooking = (sequelize) => {
	Booking.init({
		booking_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		service_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		client_id: { // Cliente que reserva el servicio
			type: DataTypes.UUID,
			allowNull: false
		},
		employee_id: { // Empleado que presta el servicio
			type: DataTypes.UUID,
			allowNull: false
		},
		location_id: {
			type: DataTypes.UUID,
			allowNull: false
		},
		date: {
			type: DataTypes.DATEONLY, // Fecha de la reserva
			allowNull: false
		},
		start_time: {
			type: DataTypes.TIME, // Hora de inicio
			allowNull: false
		},
		end_time: {
			type: DataTypes.TIME, // Hora de finalización
			allowNull: false
		},
		status: {
			type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
			defaultValue: 'pending',
			allowNull: false
		},
		notes: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		photo_consent: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		discount_code: {
			type: DataTypes.STRING,
			allowNull: true
		},
		referred_by: {
			type: DataTypes.UUID,
			allowNull: true // Si viene recomendado por otro cliente
		},


	}, {
		sequelize,
		tableName: 'booking',
		modelName: 'Booking',
		timestamps: true
	});

	return Booking;
};

export default initializeBooking;
