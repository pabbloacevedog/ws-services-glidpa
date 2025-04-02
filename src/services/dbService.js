import { Op } from 'sequelize';
import Schedule from '../models/schedule.model.js';
import Location from '../models/location.model.js';
import Service from '../models/service.model.js';
import ServiceType from '../models/serviceType.model.js';
import FAQ from '../models/faq.model.js';
import Company from '../models/company.model.js';
import SocialNetworkCompany from '../models/socialNetworkCompany.model.js';
import logger from '../utils/logger.js';

class DbService {
	// Funciones para obtener horarios
	async getSchedule() {
		try {
			return await Schedule.findAll({
				where: { is_active: true },
				order: [['day_of_week', 'ASC']]
			});
		} catch (error) {
			logger.error('Error al obtener horarios:', error);
			throw error;
		}
	}

	// Funciones para obtener ubicaciones
	async getLocations() {
		try {
			return await Location.findAll({
				where: { is_active: true },
				attributes: ['location_id', 'name', 'address', 'city', 'state', 'country', 'postal_code', 'phone', 'email', 'latitude', 'longitude']
			});
		} catch (error) {
			logger.error('Error al obtener ubicaciones:', error);
			throw error;
		}
	}

	// Funciones para obtener servicios
	async getServiceTypes() {
		try {
			return await ServiceType.findAll({
				where: { is_active: true },
				attributes: ['service_type_id', 'name', 'title', 'description', 'icon']
			});
		} catch (error) {
			logger.error('Error al obtener tipos de servicios:', error);
			throw error;
		}
	}

	async getServices() {
		try {
			return await Service.findAll({
				where: { is_active: true },
				include: [{
					model: ServiceType,
					attributes: ['name', 'title', 'description']
				}],
				attributes: ['service_id', 'name', 'description', 'duration', 'price', 'currency']
			});
		} catch (error) {
			logger.error('Error al obtener servicios:', error);
			throw error;
		}
	}

	// Funciones para obtener FAQs
	async getFAQs() {
		try {
			return await FAQ.findAll({
				where: { is_active: true },
				attributes: ['question', 'answer'],
				order: [['created_at', 'ASC']]
			});
		} catch (error) {
			logger.error('Error al obtener FAQs:', error);
			throw error;
		}
	}

	// Funciones para obtener información de la empresa
	async getCompanyInfo() {
		try {
			const company = await Company.findOne({
				where: { is_active: true },
				attributes: ['name', 'description', 'mission', 'vision', 'values', 'logo_url']
			});

			const socialNetworks = await SocialNetworkCompany.findAll({
				where: { is_active: true },
				attributes: ['network_name', 'url', 'username']
			});

			return {
				company,
				socialNetworks
			};
		} catch (error) {
			logger.error('Error al obtener información de la empresa:', error);
			throw error;
		}
	}
}

export default new DbService();