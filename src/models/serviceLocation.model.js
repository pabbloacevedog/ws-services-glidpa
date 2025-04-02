import { Model, DataTypes } from 'sequelize';

class ServiceLocation extends Model {
    static associate(models) {
        this.belongsTo(models.Service, { foreignKey: 'service_id' });
        this.belongsTo(models.Location, { foreignKey: 'location_id' });
    }
}

const initializeServiceLocation = (sequelize) => {
    ServiceLocation.init({
        service_location_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        location_id: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'service_location',
        modelName: 'ServiceLocation',
        timestamps: false
    });

    return ServiceLocation;
};

export default initializeServiceLocation;