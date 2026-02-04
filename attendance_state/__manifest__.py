{
    'name': 'Attendance Systray Indicator',
    'version': '15.0.1.0.0',
    'summary': 'Adds a green/red attendance indicator to the top bar',
    'author': 'Kais Akram',
    'depends': ['hr', 'hr_attendance'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'attendance_state/static/src/css/attendance.css',
            'attendance_state/static/src/js/systray_attendance.js',
        ],
        'web.assets_qweb': [
            'attendance_state/static/src/xml/systray_attendance.xml',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
