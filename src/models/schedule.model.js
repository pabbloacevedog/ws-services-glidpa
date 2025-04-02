import { Model, DataTypes } from 'sequelize';

class Schedule extends Model {
	static associate(models) {
		this.belongsTo(models.Location, { foreignKey: 'location_id' });
	}
}

const initializeSchedule = (sequelize) => {
	Schedule.init({
		schedule_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		location_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		day: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']]
			}
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		startTime: {
			type: DataTypes.TIME,
			allowNull: true
		},
		endTime: {
			type: DataTypes.TIME,
			allowNull: true
		},
		breakStartTime: {
			type: DataTypes.TIME,
			allowNull: true
		},
		breakDuration: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		openDuringBreak: {  // Nuevo campo booleano
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		sequelize,
		tableName: 'schedule',
		modelName: 'Schedule',
		timestamps: false,
	});

	return Schedule;
};

export default initializeSchedule;
