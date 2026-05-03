from odoo import models, fields, api
from odoo.exceptions import ValidationError

class ProjectProject(models.Model):
    _inherit = "project.project"

    ara_project_location = fields.Many2one(
        "res.partner", 
        string="Project Location", 
        context={"default_customer_rank": 1},
        help="Select customer or partner location for this project"
    )
    ara_project_latitude = fields.Float(
        string="Latitude", 
        digits=(10, 7), 
        store=True, 
        readonly=False,
        help="Geographic latitude coordinate"
    )
    ara_project_longitude = fields.Float(
        string="Longitude", 
        digits=(10, 7), 
        store=True, 
        readonly=False,
        help="Geographic longitude coordinate"
    )
    ara_has_location = fields.Boolean(
        string="Has Location",
        compute="_compute_has_location",
        store=True
    )
    
    @api.depends('ara_project_latitude', 'ara_project_longitude')
    def _compute_has_location(self):
        for project in self:
            project.ara_has_location = bool(
                project.ara_project_latitude and 
                project.ara_project_longitude and
                project.ara_project_latitude != 0 and
                project.ara_project_longitude != 0
            )
    
    @api.onchange('ara_project_location')
    def _onchange_location_partner(self):
        """Auto-fill latitude and longitude from selected partner"""
        if self.ara_project_location:
            self.ara_project_latitude = self.ara_project_location.partner_latitude
            self.ara_project_longitude = self.ara_project_location.partner_longitude
            if not self.ara_project_latitude or not self.ara_project_longitude:
                warning_msg = {
                    'title': 'Warning',
                    'message': f'Selected partner "{self.ara_project_location.display_name}" does not have coordinates set. Please enter manually or update partner address.'
                }
                return {'warning': warning_msg}
    
    @api.constrains('ara_project_latitude', 'ara_project_longitude')
    def _check_coordinates(self):
        for project in self:
            if project.ara_project_latitude and (project.ara_project_latitude < -90 or project.ara_project_latitude > 90):
                raise ValidationError("Latitude must be between -90 and 90 degrees.")
            if project.ara_project_longitude and (project.ara_project_longitude < -180 or project.ara_project_longitude > 180):
                raise ValidationError("Longitude must be between -180 and 180 degrees.")
    
    def action_open_on_osm(self):
        """Open project location on OpenStreetMap website"""
        self.ensure_one()
        if self.ara_has_location:
            return {
                'type': 'ir.actions.act_url',
                'target': 'new',
                'url': f"https://www.openstreetmap.org/?mlat={self.ara_project_latitude}&mlon={self.ara_project_longitude}#map=15/{self.ara_project_latitude}/{self.ara_project_longitude}",
            }
        else:
            raise ValidationError("This project does not have valid location coordinates.")