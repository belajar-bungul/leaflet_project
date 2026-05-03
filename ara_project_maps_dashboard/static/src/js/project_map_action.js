/** @odoo-module **/

import { registry } from "@web/core/registry"
import { ProjectMapDashboard } from "./project_map_dashboard"

// Gunakan nama yang unik untuk action
registry
    .category("actions")
    .add("ara_project_maps_dashboard.ProjectMapDashboard", ProjectMapDashboard)
