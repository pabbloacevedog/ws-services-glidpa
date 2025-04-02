import { Model, DataTypes } from 'sequelize';

class ServiceAssignment extends Model {
    static associate(models) {
        this.belongsTo(models.Service, { foreignKey: 'service_id' });
        this.belongsTo(models.User, { foreignKey: 'user_id' }); // Cambiar a `user_id`
    }
}

const initializeServiceAssignment = (sequelize) => {
    ServiceAssignment.init({
        service_assignment_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false // Asignar a usuario específico
        }
    }, {
        sequelize,
        tableName: 'service_assignment',
        modelName: 'ServiceAssignment',
        timestamps: false
    });

    return ServiceAssignment;
};

export default initializeServiceAssignment;
