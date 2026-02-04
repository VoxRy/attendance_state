from odoo import models, fields, api
from datetime import datetime, date

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    @api.model
    def get_attendance_data(self):
        employee = self.env['hr.employee'].search([('user_id', '=', self.env.uid)], limit=1)
        if not employee:
            return False
            
        today_start = datetime.combine(date.today(), datetime.min.time())
        attendances = self.env['hr.attendance'].search([
            ('employee_id', '=', employee.id),
            ('check_in', '>=', today_start)
        ])
        
        total_today = 0.0
        last_check_in = False
        
        for attendance in attendances:
            if attendance.check_out:
                total_today += attendance.worked_hours
            else:
                last_check_in = fields.Datetime.to_string(attendance.check_in)
                
        return {
            'attendance_state': employee.attendance_state,
            'last_check_in': last_check_in,
            'total_today': total_today, # in hours
        }

    @api.model
    def systray_attendance_toggle(self):
        employee = self.env['hr.employee'].search([('user_id', '=', self.env.uid)], limit=1)
        if employee:
            return employee.attendance_manual('hr_attendance.hr_attendance_action_my_attendances')
        return False

    def action_open_attendances(self):
        self.ensure_one()
        return {
            'name': 'Attendances',
            'type': 'ir.actions.act_window',
            'res_model': 'hr.attendance',
            'view_mode': 'tree,form',
            'domain': [('employee_id', '=', self.id)],
            'context': {
                'default_employee_id': self.id
            }
        }
