from odoo import http
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)


class ProjectMapController(http.Controller):

    @http.route('/ara_project_maps_dashboard/data', type='http', auth='user', methods=['GET'], csrf=False)
    def get_project_map_data(self):
        """Return all project data with coordinates"""
        try:
            # Ambil semua project yang memiliki koordinat
            projects = request.env['project.project'].sudo().search([
                ('ara_project_latitude', '!=', False),
                ('ara_project_longitude', '!=', False)
            ])

            project_data = []
            for project in projects:
                if project.ara_project_latitude and project.ara_project_longitude:
                    project_data.append({
                        'id': project.id,
                        'name': project.name,
                        'latitude': project.ara_project_latitude,
                        'longitude': project.ara_project_longitude,
                        'partner_name': project.partner_id.name if project.partner_id else '',
                        'location_name': project.ara_project_location.display_name if project.ara_project_location else '',
                        'task_count': project.task_count if project.task_count else 0
                    })

            return request.make_response(
                json.dumps(project_data),
                headers=[('Content-Type', 'application/json')]
            )
        except Exception as e:
            _logger.error(f"Error: {str(e)}")
            return request.make_response(
                json.dumps([]),
                headers=[('Content-Type', 'application/json')]
            )
