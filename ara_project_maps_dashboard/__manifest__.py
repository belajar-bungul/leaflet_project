{
    'name': 'ARA Project Maps Dashboard',
    'version': '18.0.1.0.0',
    'category': 'Project',
    'summary': 'Interactive project location map dashboard',
    'description': """
        Project Maps Dashboard
        ======================
        Displays all projects with their locations on an interactive map.
    """,
    'images': ['static/description/banner sale.gif'],
    'author': 'ARA SOFT',
    'depends': ['base', 'project', 'contacts', 'web'],
    "data": [
        "views/project_menus.xml",
        "views/project_project_views.xml",
    ],
    'assets': {
        'web.assets_backend': [
            'ara_project_maps_dashboard/static/src/css/project_map.css',
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
            'ara_project_maps_dashboard/static/src/js/project_map_dashboard.js',
            'ara_project_maps_dashboard/static/src/js/project_map_action.js',
        ],
    },
    'price' :35,
    'currency' : 'USD',
    'installable': True,
    'application': False,
    'auto_install': False,
}