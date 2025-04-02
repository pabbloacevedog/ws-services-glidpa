import { Model, DataTypes } from 'sequelize';

class ContactCompany extends Model {
    static associate(models) {
        this.belongsTo(models.Location, { foreignKey: 'location_id' });
    }
}

const initializeContactCompany = (sequelize) => {
    ContactCompany.init({
        contact_company_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        location_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        contact_phone: {
            type: DataTypes.JSON, // Usar JSON para almacenar múltiples números de teléfono
            allowNull: true
        },
        contact_email: {
            type: DataTypes.JSON,
            allowNull: true
        },

    }, {
        sequelize,
        tableName: 'contact_company',
        modelName: 'ContactCompany',
        timestamps: false,
    });

    return ContactCompany;
};

export default initializeContactCompany;
