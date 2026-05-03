/** @odoo-module **/

import {
    Component,
    onWillStart,
    onMounted,
    onWillUnmount,
    xml,
    useState,
} from "@odoo/owl"
import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"

export class ProjectMapDashboard extends Component {
    static template = xml`
        <div class="o_project_map_dashboard" style="height: 100vh; width: 100%; overflow: hidden; margin: 0; padding: 0;">
            <div t-if="state.loading" class="o_loading" style="display: flex; justify-content: center; align-items: center; height: 100vh;">
                <div style="text-align: center;">
                    <i class="fa fa-spinner fa-spin fa-3x"/>
                    <p style="margin-top: 10px;">Loading project data...</p>
                </div>
            </div>
            <div t-else="" style="height: 100%; width: 100%; position: relative;">
                <!-- Filter Container -->
                <div style="position: absolute; top: 80px; left: 15px; z-index: 1000; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-width: 320px; max-height: calc(100vh - 40px); overflow-y: auto;">
                    <!-- Filter Header with Minimize Button -->
                    <div id="filter-header" style="padding: 12px 15px; background: #f8f9fa; border-radius: 8px 8px 0 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #f8f9fa; z-index: 1;">
                        <strong>
                            <i class="fa fa-sliders-h"></i> Filter &amp; Search
                        </strong>
                        <i id="filter-icon" class="fa fa-chevron-down" style="font-size: 14px;"></i>
                    </div>
                    
                    <!-- Filter Content (can be minimized) -->
                    <div id="filter-content" style="padding: 15px; display: none;">
                        <!-- Project Filter dengan real-time search -->
                        <div style="margin-bottom: 20px;">
                            <div style="margin-bottom: 8px;">
                                <strong><i class="fa fa-search"></i> Search Project:</strong>
                            </div>
                            <input type="text" id="project-search-input" class="form-control" placeholder="Type project name to search..." style="width: 100%; margin-bottom: 10px;"/>
                            
                            <!-- List hasil pencarian project -->
                            <div id="project-search-results" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; display: none;">
                                <div id="project-results-list"></div>
                            </div>
                            
                            <!-- Dropdown project (tetap ada untuk pilihan lengkap) -->
                            <select id="project-select" class="form-control" style="width: 100%; margin-top: 10px;">
                                <option value="">-- All Projects --</option>
                                <t t-foreach="state.projects" t-as="project" t-key="project.id">
                                    <option t-att-value="project.id" t-att-data-lat="project.latitude" t-att-data-lon="project.longitude" t-att-data-name="project.name">
                                        <t t-esc="project.name"/> 
                                        <t t-if="project.location_name"> - <t t-esc="project.location_name"/></t>
                                    </option>
                                </t>
                            </select>
                            <div style="margin-top: 8px; font-size: 12px;">
                                <span class="text-muted">
                                    <i class="fa fa-map-marker"></i> 
                                    <t t-set="validProjects" t-value="state.projects.filter(p => p.latitude &amp;&amp; p.longitude)"/>
                                    <t t-esc="validProjects.length"/> projects have coordinates
                                </span>
                            </div>
                        </div>
                        
                        <!-- Divider -->
                        <hr style="margin: 15px 0;"/>
                        
                        <!-- Country Filter - below with search -->
                        <div>
                            <div style="margin-bottom: 8px;">
                                <strong><i class="fa fa-globe"></i> Filter Country:</strong>
                            </div>
                            <input type="text" id="country-search" class="form-control" placeholder="Search country..." style="width: 100%; margin-bottom: 10px;"/>
                            <select id="country-filter" class="form-control" style="width: 100%; height: 170px;" multiple="multiple" size="10">
                                <option value="">-- All Countries --</option>
                                <optgroup label="🌏 Southeast Asia">
                                    <option value="indonesia">🇮🇩 Indonesia</option>
                                    <option value="malaysia">🇲🇾 Malaysia</option>
                                    <option value="singapore">🇸🇬 Singapore</option>
                                    <option value="thailand">🇹🇭 Thailand</option>
                                    <option value="vietnam">🇻🇳 Vietnam</option>
                                    <option value="philippines">🇵🇭 Philippines</option>
                                    <option value="myanmar">🇲🇲 Myanmar</option>
                                    <option value="laos">🇱🇦 Laos</option>
                                    <option value="cambodia">🇰🇭 Cambodia</option>
                                    <option value="brunei">🇧🇳 Brunei</option>
                                    <option value="timor_leste">🇹🇱 Timor Leste</option>
                                </optgroup>
                                <optgroup label="🌏 East Asia">
                                    <option value="china">🇨🇳 China</option>
                                    <option value="japan">🇯🇵 Japan</option>
                                    <option value="south_korea">🇰🇷 South Korea</option>
                                    <option value="north_korea">🇰🇵 North Korea</option>
                                    <option value="taiwan">🇹🇼 Taiwan</option>
                                    <option value="mongolia">🇲🇳 Mongolia</option>
                                </optgroup>
                                <optgroup label="🌏 South Asia">
                                    <option value="india">🇮🇳 India</option>
                                    <option value="pakistan">🇵🇰 Pakistan</option>
                                    <option value="bangladesh">🇧🇩 Bangladesh</option>
                                    <option value="nepal">🇳🇵 Nepal</option>
                                    <option value="sri_lanka">🇱🇰 Sri Lanka</option>
                                    <option value="bhutan">🇧🇹 Bhutan</option>
                                    <option value="maldives">🇲🇻 Maldives</option>
                                </optgroup>
                                <optgroup label="🌏 Central Asia">
                                    <option value="kazakhstan">🇰🇿 Kazakhstan</option>
                                    <option value="uzbekistan">🇺🇿 Uzbekistan</option>
                                    <option value="turkmenistan">🇹🇲 Turkmenistan</option>
                                    <option value="kyrgyzstan">🇰🇬 Kyrgyzstan</option>
                                    <option value="tajikistan">🇹🇯 Tajikistan</option>
                                </optgroup>
                                <optgroup label="🌏 Middle East">
                                    <option value="saudi_arabia">🇸🇦 Saudi Arabia</option>
                                    <option value="iran">🇮🇷 Iran</option>
                                    <option value="iraq">🇮🇶 Iraq</option>
                                    <option value="turkey">🇹🇷 Turkey</option>
                                    <option value="uae">🇦🇪 UAE</option>
                                    <option value="qatar">🇶🇦 Qatar</option>
                                    <option value="kuwait">🇰🇼 Kuwait</option>
                                    <option value="oman">🇴🇲 Oman</option>
                                    <option value="bahrain">🇧🇭 Bahrain</option>
                                    <option value="yemen">🇾🇪 Yemen</option>
                                    <option value="jordan">🇯🇴 Jordan</option>
                                    <option value="lebanon">🇱🇧 Lebanon</option>
                                    <option value="syria">🇸🇾 Syria</option>
                                    <option value="israel">🇮🇱 Israel</option>
                                    <option value="palestine">🇵🇸 Palestine</option>
                                </optgroup>
                                <optgroup label="🌍 Europe">
                                    <option value="uk">🇬🇧 United Kingdom</option>
                                    <option value="germany">🇩🇪 Germany</option>
                                    <option value="france">🇫🇷 France</option>
                                    <option value="netherlands">🇳🇱 Netherlands</option>
                                    <option value="italy">🇮🇹 Italy</option>
                                    <option value="spain">🇪🇸 Spain</option>
                                    <option value="portugal">🇵🇹 Portugal</option>
                                    <option value="belgium">🇧🇪 Belgium</option>
                                    <option value="switzerland">🇨🇭 Switzerland</option>
                                    <option value="austria">🇦🇹 Austria</option>
                                    <option value="sweden">🇸🇪 Sweden</option>
                                    <option value="norway">🇳🇴 Norway</option>
                                    <option value="denmark">🇩🇰 Denmark</option>
                                    <option value="finland">🇫🇮 Finland</option>
                                    <option value="iceland">🇮🇸 Iceland</option>
                                    <option value="ireland">🇮🇪 Ireland</option>
                                    <option value="poland">🇵🇱 Poland</option>
                                    <option value="czech_republic">🇨🇿 Czech Republic</option>
                                    <option value="slovakia">🇸🇰 Slovakia</option>
                                    <option value="hungary">🇭🇺 Hungary</option>
                                    <option value="romania">🇷🇴 Romania</option>
                                    <option value="bulgaria">🇧🇬 Bulgaria</option>
                                    <option value="greece">🇬🇷 Greece</option>
                                    <option value="croatia">🇭🇷 Croatia</option>
                                    <option value="serbia">🇷🇸 Serbia</option>
                                    <option value="russia">🇷🇺 Russia</option>
                                </optgroup>
                                <optgroup label="🌍 Africa">
                                    <option value="egypt">🇪🇬 Egypt</option>
                                    <option value="south_africa">🇿🇦 South Africa</option>
                                    <option value="nigeria">🇳🇬 Nigeria</option>
                                    <option value="kenya">🇰🇪 Kenya</option>
                                    <option value="morocco">🇲🇦 Morocco</option>
                                    <option value="algeria">🇩🇿 Algeria</option>
                                    <option value="tunisia">🇹🇳 Tunisia</option>
                                    <option value="ghana">🇬🇭 Ghana</option>
                                    <option value="ethiopia">🇪🇹 Ethiopia</option>
                                    <option value="tanzania">🇹🇿 Tanzania</option>
                                    <option value="uganda">🇺🇬 Uganda</option>
                                    <option value="sudan">🇸🇩 Sudan</option>
                                    <option value="angola">🇦🇴 Angola</option>
                                    <option value="zimbabwe">🇿🇼 Zimbabwe</option>
                                    <option value="senegal">🇸🇳 Senegal</option>
                                </optgroup>
                                <optgroup label="🌎 North America">
                                    <option value="usa">🇺🇸 United States</option>
                                    <option value="canada">🇨🇦 Canada</option>
                                    <option value="mexico">🇲🇽 Mexico</option>
                                </optgroup>
                                <optgroup label="🌎 Central America &amp; Caribbean">
                                    <option value="guatemala">🇬🇹 Guatemala</option>
                                    <option value="belize">🇧🇿 Belize</option>
                                    <option value="honduras">🇭🇳 Honduras</option>
                                    <option value="el_salvador">🇸🇻 El Salvador</option>
                                    <option value="nicaragua">🇳🇮 Nicaragua</option>
                                    <option value="costa_rica">🇨🇷 Costa Rica</option>
                                    <option value="panama">🇵🇦 Panama</option>
                                    <option value="cuba">🇨🇺 Cuba</option>
                                    <option value="jamaica">🇯🇲 Jamaica</option>
                                    <option value="dominican_republic">🇩🇴 Dominican Republic</option>
                                    <option value="puerto_rico">🇵🇷 Puerto Rico</option>
                                </optgroup>
                                <optgroup label="🌎 South America">
                                    <option value="brazil">🇧🇷 Brazil</option>
                                    <option value="argentina">🇦🇷 Argentina</option>
                                    <option value="chile">🇨🇱 Chile</option>
                                    <option value="peru">🇵🇪 Peru</option>
                                    <option value="colombia">🇨🇴 Colombia</option>
                                    <option value="venezuela">🇻🇪 Venezuela</option>
                                    <option value="ecuador">🇪🇨 Ecuador</option>
                                    <option value="bolivia">🇧🇴 Bolivia</option>
                                    <option value="paraguay">🇵🇾 Paraguay</option>
                                    <option value="uruguay">🇺🇾 Uruguay</option>
                                    <option value="guyana">🇬🇾 Guyana</option>
                                    <option value="suriname">🇸🇷 Suriname</option>
                                </optgroup>
                                <optgroup label="🌏 Oceania">
                                    <option value="australia">🇦🇺 Australia</option>
                                    <option value="new_zealand">🇳🇿 New Zealand</option>
                                    <option value="papua_new_guinea">🇵🇬 Papua New Guinea</option>
                                    <option value="fiji">🇫🇯 Fiji</option>
                                    <option value="solomon_islands">🇸🇧 Solomon Islands</option>
                                    <option value="vanuatu">🇻🇺 Vanuatu</option>
                                    <option value="samoa">🇼🇸 Samoa</option>
                                    <option value="tonga">🇹🇴 Tonga</option>
                                </optgroup>
                            </select>
                            <div style="margin-top: 8px;">
                                <small class="text-muted">
                                    <i class="fa fa-info-circle"></i> Select country to auto-zoom (Ctrl+click for multi-select)
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Map Container -->
                <div id="project-map" style="height: 100%; width: 100%;"/>
            </div>
            
            <!-- Reset to Default View Button -->
            <div style="position: absolute; top: 720px; right: 20px; z-index: 1000;">
                <button id="reset-default-view" class="btn btn-primary" style="border-radius: 50px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <i class="fa fa-globe"></i> Reset to Whole World
                </button>
            </div>
        </div>
    `

    setup() {
        this.notification = useService("notification")
        this.action = useService("action")

        this.state = useState({
            loading: true,
            projects: [],
            filteredProjects: [],
            selectedProjectId: null,
            searchTerm: "",
        })

        this.map = null
        this.markers = []
        this.currentHighlight = null
        this.selectedMarker = null
        this.isFilterMinimized = true

        // Complete country data worldwide
        this.countries = {
            // Southeast Asia
            indonesia: {
                name: "Indonesia",
                bounds: [
                    [-10.0, 95.0],
                    [6.0, 141.0],
                ],
                zoom: 5,
                center: [-2.548926, 118.014863],
            },
            malaysia: {
                name: "Malaysia",
                bounds: [
                    [0.5, 99.5],
                    [7.5, 119.5],
                ],
                zoom: 6,
                center: [3.0, 109.5],
            },
            singapore: {
                name: "Singapore",
                bounds: [
                    [1.2, 103.6],
                    [1.5, 104.1],
                ],
                zoom: 11,
                center: [1.3521, 103.8198],
            },
            thailand: {
                name: "Thailand",
                bounds: [
                    [5.5, 97.0],
                    [20.5, 105.5],
                ],
                zoom: 6,
                center: [13.0, 101.5],
            },
            vietnam: {
                name: "Vietnam",
                bounds: [
                    [8.0, 102.0],
                    [23.5, 109.5],
                ],
                zoom: 6,
                center: [16.0, 106.0],
            },
            philippines: {
                name: "Philippines",
                bounds: [
                    [4.5, 116.5],
                    [21.0, 127.0],
                ],
                zoom: 6,
                center: [12.0, 122.0],
            },
            myanmar: {
                name: "Myanmar",
                bounds: [
                    [9.5, 92.0],
                    [28.5, 101.0],
                ],
                zoom: 6,
                center: [19.0, 96.5],
            },
            laos: {
                name: "Laos",
                bounds: [
                    [13.5, 100.0],
                    [22.5, 107.5],
                ],
                zoom: 7,
                center: [18.0, 103.5],
            },
            cambodia: {
                name: "Cambodia",
                bounds: [
                    [9.0, 102.0],
                    [15.0, 108.0],
                ],
                zoom: 7,
                center: [12.0, 105.0],
            },
            brunei: {
                name: "Brunei",
                bounds: [
                    [4.0, 114.0],
                    [5.5, 115.5],
                ],
                zoom: 10,
                center: [4.5, 114.7],
            },
            timor_leste: {
                name: "Timor Leste",
                bounds: [
                    [-9.5, 124.0],
                    [-8.0, 127.5],
                ],
                zoom: 8,
                center: [-8.8, 125.7],
            },

            // East Asia
            china: {
                name: "China",
                bounds: [
                    [18.0, 73.0],
                    [53.5, 135.0],
                ],
                zoom: 5,
                center: [35.0, 104.0],
            },
            japan: {
                name: "Japan",
                bounds: [
                    [30.0, 128.0],
                    [46.0, 146.0],
                ],
                zoom: 5,
                center: [36.2048, 138.2529],
            },
            south_korea: {
                name: "South Korea",
                bounds: [
                    [33.0, 124.0],
                    [39.0, 132.0],
                ],
                zoom: 7,
                center: [35.9078, 127.7669],
            },
            north_korea: {
                name: "North Korea",
                bounds: [
                    [37.0, 124.0],
                    [43.0, 131.0],
                ],
                zoom: 7,
                center: [40.0, 127.0],
            },
            taiwan: {
                name: "Taiwan",
                bounds: [
                    [21.5, 119.5],
                    [25.5, 122.5],
                ],
                zoom: 8,
                center: [23.5, 121.0],
            },
            mongolia: {
                name: "Mongolia",
                bounds: [
                    [41.0, 87.0],
                    [52.0, 120.0],
                ],
                zoom: 6,
                center: [46.0, 103.0],
            },

            // South Asia
            india: {
                name: "India",
                bounds: [
                    [6.0, 68.0],
                    [35.5, 97.5],
                ],
                zoom: 5,
                center: [20.5937, 78.9629],
            },
            pakistan: {
                name: "Pakistan",
                bounds: [
                    [23.0, 60.0],
                    [37.0, 77.0],
                ],
                zoom: 6,
                center: [30.0, 70.0],
            },
            bangladesh: {
                name: "Bangladesh",
                bounds: [
                    [20.5, 88.0],
                    [26.5, 92.5],
                ],
                zoom: 7,
                center: [23.5, 90.0],
            },
            nepal: {
                name: "Nepal",
                bounds: [
                    [26.0, 80.0],
                    [30.5, 88.5],
                ],
                zoom: 7,
                center: [28.0, 84.0],
            },
            sri_lanka: {
                name: "Sri Lanka",
                bounds: [
                    [5.5, 79.5],
                    [10.0, 82.0],
                ],
                zoom: 8,
                center: [7.0, 81.0],
            },
            bhutan: {
                name: "Bhutan",
                bounds: [
                    [26.5, 88.5],
                    [28.5, 92.5],
                ],
                zoom: 8,
                center: [27.5, 90.5],
            },
            maldives: {
                name: "Maldives",
                bounds: [
                    [-0.5, 72.5],
                    [7.5, 73.5],
                ],
                zoom: 9,
                center: [3.0, 73.0],
            },

            // Central Asia
            kazakhstan: {
                name: "Kazakhstan",
                bounds: [
                    [40.0, 46.0],
                    [55.0, 87.0],
                ],
                zoom: 5,
                center: [48.0, 68.0],
            },
            uzbekistan: {
                name: "Uzbekistan",
                bounds: [
                    [37.0, 56.0],
                    [45.5, 73.0],
                ],
                zoom: 6,
                center: [41.0, 64.0],
            },
            turkmenistan: {
                name: "Turkmenistan",
                bounds: [
                    [35.0, 52.0],
                    [42.5, 66.0],
                ],
                zoom: 6,
                center: [38.0, 59.0],
            },
            kyrgyzstan: {
                name: "Kyrgyzstan",
                bounds: [
                    [39.0, 69.0],
                    [43.5, 80.0],
                ],
                zoom: 7,
                center: [41.0, 74.0],
            },
            tajikistan: {
                name: "Tajikistan",
                bounds: [
                    [36.5, 67.0],
                    [41.0, 75.0],
                ],
                zoom: 7,
                center: [38.0, 71.0],
            },

            // Middle East
            saudi_arabia: {
                name: "Saudi Arabia",
                bounds: [
                    [16.0, 34.0],
                    [32.0, 55.0],
                ],
                zoom: 6,
                center: [24.0, 45.0],
            },
            iran: {
                name: "Iran",
                bounds: [
                    [25.0, 44.0],
                    [40.0, 63.0],
                ],
                zoom: 6,
                center: [32.0, 53.0],
            },
            iraq: {
                name: "Iraq",
                bounds: [
                    [29.0, 38.0],
                    [37.5, 48.5],
                ],
                zoom: 7,
                center: [33.0, 43.0],
            },
            turkey: {
                name: "Turkey",
                bounds: [
                    [35.5, 25.5],
                    [42.0, 45.0],
                ],
                zoom: 6,
                center: [38.0, 35.0],
            },
            uae: {
                name: "UAE",
                bounds: [
                    [22.5, 51.5],
                    [26.0, 56.5],
                ],
                zoom: 8,
                center: [24.0, 54.0],
            },
            qatar: {
                name: "Qatar",
                bounds: [
                    [24.5, 50.5],
                    [26.0, 51.5],
                ],
                zoom: 9,
                center: [25.5, 51.0],
            },
            kuwait: {
                name: "Kuwait",
                bounds: [
                    [28.5, 46.5],
                    [30.0, 48.5],
                ],
                zoom: 9,
                center: [29.5, 47.5],
            },
            oman: {
                name: "Oman",
                bounds: [
                    [16.5, 52.0],
                    [26.5, 60.0],
                ],
                zoom: 7,
                center: [21.0, 55.0],
            },
            bahrain: {
                name: "Bahrain",
                bounds: [
                    [25.5, 50.3],
                    [26.5, 50.8],
                ],
                zoom: 10,
                center: [26.0, 50.5],
            },
            yemen: {
                name: "Yemen",
                bounds: [
                    [12.0, 42.0],
                    [19.0, 53.0],
                ],
                zoom: 7,
                center: [15.0, 47.0],
            },
            jordan: {
                name: "Jordan",
                bounds: [
                    [29.0, 34.5],
                    [33.0, 39.0],
                ],
                zoom: 8,
                center: [31.0, 36.5],
            },
            lebanon: {
                name: "Lebanon",
                bounds: [
                    [33.0, 35.0],
                    [34.5, 36.5],
                ],
                zoom: 9,
                center: [33.8, 35.8],
            },
            syria: {
                name: "Syria",
                bounds: [
                    [32.0, 35.5],
                    [37.5, 42.5],
                ],
                zoom: 7,
                center: [35.0, 38.0],
            },
            israel: {
                name: "Israel",
                bounds: [
                    [29.5, 34.2],
                    [33.3, 35.9],
                ],
                zoom: 8,
                center: [31.0, 35.0],
            },
            palestine: {
                name: "Palestine",
                bounds: [
                    [31.2, 34.2],
                    [32.5, 35.5],
                ],
                zoom: 9,
                center: [31.9, 35.2],
            },

            // Europe
            uk: {
                name: "United Kingdom",
                bounds: [
                    [49.0, -8.0],
                    [59.0, 2.0],
                ],
                zoom: 6,
                center: [55.3781, -3.436],
            },
            germany: {
                name: "Germany",
                bounds: [
                    [47.0, 5.0],
                    [55.0, 15.0],
                ],
                zoom: 6,
                center: [51.1657, 10.4515],
            },
            france: {
                name: "France",
                bounds: [
                    [41.0, -5.0],
                    [51.5, 9.5],
                ],
                zoom: 6,
                center: [46.2276, 2.2137],
            },
            netherlands: {
                name: "Netherlands",
                bounds: [
                    [50.5, 3.0],
                    [53.5, 7.5],
                ],
                zoom: 8,
                center: [52.1326, 5.2913],
            },
            italy: {
                name: "Italy",
                bounds: [
                    [36.5, 6.5],
                    [47.5, 18.5],
                ],
                zoom: 6,
                center: [41.8719, 12.5674],
            },
            spain: {
                name: "Spain",
                bounds: [
                    [35.0, -9.5],
                    [44.0, 4.0],
                ],
                zoom: 6,
                center: [40.4637, -3.7492],
            },
            portugal: {
                name: "Portugal",
                bounds: [
                    [36.0, -9.5],
                    [42.0, -6.0],
                ],
                zoom: 7,
                center: [39.3999, -8.2245],
            },
            belgium: {
                name: "Belgium",
                bounds: [
                    [49.5, 2.5],
                    [51.5, 6.5],
                ],
                zoom: 8,
                center: [50.8503, 4.3517],
            },
            switzerland: {
                name: "Switzerland",
                bounds: [
                    [45.8, 5.9],
                    [47.8, 10.5],
                ],
                zoom: 8,
                center: [46.8182, 8.2275],
            },
            austria: {
                name: "Austria",
                bounds: [
                    [46.3, 9.5],
                    [49.0, 17.0],
                ],
                zoom: 7,
                center: [47.5162, 14.5501],
            },
            sweden: {
                name: "Sweden",
                bounds: [
                    [55.0, 10.0],
                    [69.0, 24.0],
                ],
                zoom: 5,
                center: [60.1282, 18.6435],
            },
            norway: {
                name: "Norway",
                bounds: [
                    [57.0, 4.0],
                    [71.5, 31.0],
                ],
                zoom: 5,
                center: [60.472, 8.4689],
            },
            denmark: {
                name: "Denmark",
                bounds: [
                    [54.5, 8.0],
                    [57.5, 15.0],
                ],
                zoom: 7,
                center: [56.2639, 9.5018],
            },
            finland: {
                name: "Finland",
                bounds: [
                    [59.5, 19.0],
                    [70.0, 31.0],
                ],
                zoom: 5,
                center: [61.9241, 25.7482],
            },
            iceland: {
                name: "Iceland",
                bounds: [
                    [63.0, -25.0],
                    [67.0, -13.0],
                ],
                zoom: 6,
                center: [64.9631, -19.0208],
            },
            ireland: {
                name: "Ireland",
                bounds: [
                    [51.0, -10.5],
                    [55.5, -5.5],
                ],
                zoom: 7,
                center: [53.1424, -7.6921],
            },
            poland: {
                name: "Poland",
                bounds: [
                    [49.0, 14.0],
                    [55.0, 24.0],
                ],
                zoom: 6,
                center: [51.9194, 19.1451],
            },
            czech_republic: {
                name: "Czech Republic",
                bounds: [
                    [48.5, 12.0],
                    [51.0, 19.0],
                ],
                zoom: 7,
                center: [49.8175, 15.473],
            },
            slovakia: {
                name: "Slovakia",
                bounds: [
                    [47.5, 16.5],
                    [49.5, 22.5],
                ],
                zoom: 7,
                center: [48.669, 19.699],
            },
            hungary: {
                name: "Hungary",
                bounds: [
                    [45.5, 16.0],
                    [48.5, 23.0],
                ],
                zoom: 7,
                center: [47.1625, 19.5033],
            },
            romania: {
                name: "Romania",
                bounds: [
                    [43.5, 20.0],
                    [48.5, 29.5],
                ],
                zoom: 6,
                center: [45.9432, 24.9668],
            },
            bulgaria: {
                name: "Bulgaria",
                bounds: [
                    [41.0, 22.0],
                    [44.5, 28.5],
                ],
                zoom: 7,
                center: [42.7339, 25.4858],
            },
            greece: {
                name: "Greece",
                bounds: [
                    [34.5, 19.0],
                    [42.0, 29.0],
                ],
                zoom: 7,
                center: [39.0742, 21.8243],
            },
            croatia: {
                name: "Croatia",
                bounds: [
                    [42.0, 13.0],
                    [46.5, 19.5],
                ],
                zoom: 7,
                center: [45.1, 15.2],
            },
            serbia: {
                name: "Serbia",
                bounds: [
                    [42.0, 18.5],
                    [46.5, 23.0],
                ],
                zoom: 7,
                center: [44.0165, 21.0059],
            },
            russia: {
                name: "Russia",
                bounds: [
                    [41.0, 19.0],
                    [82.0, -169.0],
                ],
                zoom: 4,
                center: [61.524, 105.3188],
            },

            // Africa
            egypt: {
                name: "Egypt",
                bounds: [
                    [22.0, 24.0],
                    [31.5, 36.0],
                ],
                zoom: 6,
                center: [26.8206, 30.8025],
            },
            south_africa: {
                name: "South Africa",
                bounds: [
                    [-35.0, 16.0],
                    [-22.0, 33.0],
                ],
                zoom: 5,
                center: [-30.5595, 22.9375],
            },
            nigeria: {
                name: "Nigeria",
                bounds: [
                    [4.0, 2.5],
                    [14.0, 14.5],
                ],
                zoom: 6,
                center: [9.082, 8.6753],
            },
            kenya: {
                name: "Kenya",
                bounds: [
                    [-4.5, 33.5],
                    [5.0, 42.0],
                ],
                zoom: 6,
                center: [-1.2864, 36.8172],
            },
            morocco: {
                name: "Morocco",
                bounds: [
                    [27.5, -13.0],
                    [36.0, -1.0],
                ],
                zoom: 6,
                center: [31.7917, -7.0926],
            },
            algeria: {
                name: "Algeria",
                bounds: [
                    [18.5, -8.5],
                    [37.5, 12.0],
                ],
                zoom: 5,
                center: [28.0339, 1.6596],
            },
            tunisia: {
                name: "Tunisia",
                bounds: [
                    [30.0, 7.5],
                    [37.5, 11.5],
                ],
                zoom: 7,
                center: [33.8869, 9.5375],
            },
            ghana: {
                name: "Ghana",
                bounds: [
                    [4.5, -3.5],
                    [11.0, 1.5],
                ],
                zoom: 7,
                center: [7.9465, -1.0232],
            },
            ethiopia: {
                name: "Ethiopia",
                bounds: [
                    [3.0, 32.5],
                    [15.0, 48.0],
                ],
                zoom: 6,
                center: [9.145, 40.4897],
            },
            tanzania: {
                name: "Tanzania",
                bounds: [
                    [-11.5, 29.0],
                    [-0.5, 40.5],
                ],
                zoom: 6,
                center: [-6.369, 34.8888],
            },
            uganda: {
                name: "Uganda",
                bounds: [
                    [-1.5, 29.5],
                    [4.5, 35.0],
                ],
                zoom: 7,
                center: [1.3733, 32.2903],
            },
            sudan: {
                name: "Sudan",
                bounds: [
                    [8.0, 21.5],
                    [22.0, 38.5],
                ],
                zoom: 6,
                center: [12.8628, 30.2176],
            },
            angola: {
                name: "Angola",
                bounds: [
                    [-18.0, 11.0],
                    [-4.0, 24.0],
                ],
                zoom: 6,
                center: [-11.2027, 17.8739],
            },
            zimbabwe: {
                name: "Zimbabwe",
                bounds: [
                    [-22.5, 25.0],
                    [-15.5, 33.0],
                ],
                zoom: 7,
                center: [-19.0154, 29.1549],
            },
            senegal: {
                name: "Senegal",
                bounds: [
                    [12.0, -17.5],
                    [16.5, -11.0],
                ],
                zoom: 7,
                center: [14.4974, -14.4524],
            },

            // North America
            usa: {
                name: "United States",
                bounds: [
                    [24.0, -125.0],
                    [49.0, -66.0],
                ],
                zoom: 4,
                center: [37.0902, -95.7129],
            },
            canada: {
                name: "Canada",
                bounds: [
                    [41.0, -141.0],
                    [83.0, -52.0],
                ],
                zoom: 4,
                center: [56.1304, -106.3468],
            },
            mexico: {
                name: "Mexico",
                bounds: [
                    [14.0, -117.0],
                    [33.0, -86.0],
                ],
                zoom: 5,
                center: [23.6345, -102.5528],
            },

            // Central America & Caribbean
            guatemala: {
                name: "Guatemala",
                bounds: [
                    [13.5, -92.5],
                    [17.5, -88.0],
                ],
                zoom: 7,
                center: [15.7835, -90.2308],
            },
            belize: {
                name: "Belize",
                bounds: [
                    [15.5, -89.5],
                    [18.5, -87.5],
                ],
                zoom: 8,
                center: [17.1899, -88.4976],
            },
            honduras: {
                name: "Honduras",
                bounds: [
                    [12.5, -89.5],
                    [16.5, -83.0],
                ],
                zoom: 7,
                center: [15.2, -86.2419],
            },
            el_salvador: {
                name: "El Salvador",
                bounds: [
                    [13.0, -90.5],
                    [14.5, -87.5],
                ],
                zoom: 8,
                center: [13.7942, -88.8965],
            },
            nicaragua: {
                name: "Nicaragua",
                bounds: [
                    [10.5, -87.5],
                    [15.0, -83.0],
                ],
                zoom: 7,
                center: [12.8654, -85.2072],
            },
            costa_rica: {
                name: "Costa Rica",
                bounds: [
                    [8.0, -86.0],
                    [11.5, -82.5],
                ],
                zoom: 8,
                center: [9.7489, -83.7534],
            },
            panama: {
                name: "Panama",
                bounds: [
                    [7.0, -83.0],
                    [9.5, -77.0],
                ],
                zoom: 8,
                center: [8.538, -80.7821],
            },
            cuba: {
                name: "Cuba",
                bounds: [
                    [19.5, -85.0],
                    [23.5, -74.0],
                ],
                zoom: 7,
                center: [21.5218, -77.7812],
            },
            jamaica: {
                name: "Jamaica",
                bounds: [
                    [17.5, -78.5],
                    [18.5, -76.0],
                ],
                zoom: 9,
                center: [18.1096, -77.2975],
            },
            dominican_republic: {
                name: "Dominican Republic",
                bounds: [
                    [17.5, -72.0],
                    [20.0, -68.0],
                ],
                zoom: 8,
                center: [18.7357, -70.1627],
            },
            puerto_rico: {
                name: "Puerto Rico",
                bounds: [
                    [17.5, -67.5],
                    [18.5, -65.0],
                ],
                zoom: 9,
                center: [18.2208, -66.5901],
            },

            // South America
            brazil: {
                name: "Brazil",
                bounds: [
                    [-33.5, -74.0],
                    [5.0, -34.0],
                ],
                zoom: 4,
                center: [-14.235, -51.9253],
            },
            argentina: {
                name: "Argentina",
                bounds: [
                    [-55.0, -73.0],
                    [-21.0, -53.0],
                ],
                zoom: 4,
                center: [-38.4161, -63.6167],
            },
            chile: {
                name: "Chile",
                bounds: [
                    [-56.0, -76.0],
                    [-17.0, -66.0],
                ],
                zoom: 5,
                center: [-35.6751, -71.543],
            },
            peru: {
                name: "Peru",
                bounds: [
                    [-18.5, -81.5],
                    [-0.5, -68.0],
                ],
                zoom: 5,
                center: [-9.19, -75.0152],
            },
            colombia: {
                name: "Colombia",
                bounds: [
                    [-4.5, -79.0],
                    [13.5, -66.5],
                ],
                zoom: 5,
                center: [4.5709, -74.2973],
            },
            venezuela: {
                name: "Venezuela",
                bounds: [
                    [0.5, -73.5],
                    [12.5, -59.5],
                ],
                zoom: 6,
                center: [6.4238, -66.5897],
            },
            ecuador: {
                name: "Ecuador",
                bounds: [
                    [-5.0, -81.5],
                    [1.5, -75.0],
                ],
                zoom: 7,
                center: [-1.8312, -78.1834],
            },
            bolivia: {
                name: "Bolivia",
                bounds: [
                    [-23.0, -69.5],
                    [-9.5, -57.0],
                ],
                zoom: 6,
                center: [-16.2902, -63.5887],
            },
            paraguay: {
                name: "Paraguay",
                bounds: [
                    [-27.5, -62.5],
                    [-19.0, -54.0],
                ],
                zoom: 7,
                center: [-23.4425, -58.4438],
            },
            uruguay: {
                name: "Uruguay",
                bounds: [
                    [-35.0, -58.5],
                    [-30.0, -53.0],
                ],
                zoom: 7,
                center: [-32.5228, -55.7658],
            },
            guyana: {
                name: "Guyana",
                bounds: [
                    [1.0, -61.5],
                    [8.5, -56.0],
                ],
                zoom: 7,
                center: [4.8604, -58.9302],
            },
            suriname: {
                name: "Suriname",
                bounds: [
                    [1.5, -58.5],
                    [6.0, -53.5],
                ],
                zoom: 7,
                center: [3.9193, -56.0278],
            },

            // Oceania
            australia: {
                name: "Australia",
                bounds: [
                    [-44.0, 112.0],
                    [-9.0, 154.0],
                ],
                zoom: 4,
                center: [-25.2744, 133.7751],
            },
            new_zealand: {
                name: "New Zealand",
                bounds: [
                    [-47.5, 166.0],
                    [-34.0, 179.0],
                ],
                zoom: 6,
                center: [-40.9006, 174.886],
            },
            papua_new_guinea: {
                name: "Papua New Guinea",
                bounds: [
                    [-11.5, 140.5],
                    [-0.5, 156.0],
                ],
                zoom: 6,
                center: [-6.3149, 143.9555],
            },
            fiji: {
                name: "Fiji",
                bounds: [
                    [-19.0, 176.5],
                    [-15.5, 179.0],
                ],
                zoom: 8,
                center: [-17.7134, 178.065],
            },
            solomon_islands: {
                name: "Solomon Islands",
                bounds: [
                    [-12.0, 155.0],
                    [-5.0, 163.0],
                ],
                zoom: 7,
                center: [-9.6457, 160.1562],
            },
            vanuatu: {
                name: "Vanuatu",
                bounds: [
                    [-17.0, 166.0],
                    [-13.0, 170.0],
                ],
                zoom: 8,
                center: [-15.3767, 166.9592],
            },
            samoa: {
                name: "Samoa",
                bounds: [
                    [-14.5, -172.5],
                    [-13.0, -171.0],
                ],
                zoom: 9,
                center: [-13.759, -172.1046],
            },
            tonga: {
                name: "Tonga",
                bounds: [
                    [-22.0, -176.0],
                    [-18.0, -173.0],
                ],
                zoom: 9,
                center: [-20.1877, -174.2083],
            },
        }

        // Tambahkan CSS tambahan untuk memastikan map full height
        const style = document.createElement("style")
        style.textContent = `
            .o_project_map_dashboard,
            .o_project_map_dashboard > div {
                height: 100vh !important;
                overflow: hidden;
                margin: 0;
                padding: 0;
            }
            
            .leaflet-container {
                background: #f8f9fa;
                height: 100% !important;
                width: 100% !important;
            }
            
            #project-map {
                height: 100% !important;
                width: 100% !important;
            }
            
            @keyframes pulse {
                0% { transform: scale(0.8); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
                100% { transform: scale(0.8); opacity: 1; }
            }
            
            .highlight-marker div { 
                animation: pulse 1.5s infinite; 
            }
            
            .project-search-item {
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background 0.2s;
            }
            
            .project-search-item:hover {
                background: #f0f0f0;
            }
            
            .project-search-item.selected {
                background: #e3f2fd;
            }
            
            .project-search-item strong {
                color: #333;
            }
            
            .project-search-item .location {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }
            
            .project-search-item .coordinates {
                font-size: 11px;
                color: #999;
                margin-top: 2px;
            }
        `
        document.head.appendChild(style)

        onWillStart(async () => {
            await this.loadProjects()
        })

        onMounted(() => {
            this.initMap()
            this.setupResetButton()
            this.setupCountryFilter()
            this.setupCountrySearch()
            this.setupProjectRealTimeSearch()
            this.setupProjectSelect()
            this.setupClearHighlightButton()
            this.setupFilterToggle()
            this.setupClearProjectFilter()

            // Tambahkan resize handler
            window.addEventListener("resize", () => {
                if (this.map) {
                    setTimeout(() => {
                        this.map.invalidateSize()
                    }, 100)
                }
            })
        })

        onWillUnmount(() => {
            if (this.map) {
                this.map.remove()
            }
            // Hapus style tambahan
            if (style.parentNode) {
                style.parentNode.removeChild(style)
            }
        })
    }

    setupProjectRealTimeSearch() {
        const checkExist = setInterval(() => {
            const searchInput = document.getElementById("project-search-input")
            const resultsDiv = document.getElementById("project-search-results")

            if (searchInput && resultsDiv && this.map) {
                clearInterval(checkExist)

                searchInput.oninput = event => {
                    const searchTerm = event.target.value.toLowerCase().trim()

                    if (searchTerm === "") {
                        resultsDiv.style.display = "none"
                        this.clearProjectFilter()
                        return
                    }

                    // Filter projects based on search term
                    const matchedProjects = this.state.projects.filter(
                        project =>
                            project.name.toLowerCase().includes(searchTerm) ||
                            (project.location_name &&
                                project.location_name
                                    .toLowerCase()
                                    .includes(searchTerm)) ||
                            (project.partner_name &&
                                project.partner_name
                                    .toLowerCase()
                                    .includes(searchTerm))
                    )

                    if (matchedProjects.length > 0) {
                        this.displaySearchResults(matchedProjects, searchTerm)
                        resultsDiv.style.display = "block"
                    } else {
                        resultsDiv.style.display = "none"
                        this.notification.add(
                            "No projects found matching your search",
                            { type: "warning" }
                        )
                    }
                }

                // Close results when clicking outside
                document.addEventListener("click", event => {
                    if (
                        !searchInput.contains(event.target) &&
                        !resultsDiv.contains(event.target)
                    ) {
                        resultsDiv.style.display = "none"
                    }
                })
            }
        }, 100)
    }

    displaySearchResults(projects, searchTerm) {
        const resultsList = document.getElementById("project-results-list")
        if (!resultsList) return

        resultsList.innerHTML = ""

        projects.forEach(project => {
            const item = document.createElement("div")
            item.className = "project-search-item"

            // Highlight matching text
            let nameHtml = this.escapeHtml(project.name)
            const locationHtml = project.location_name
                ? this.escapeHtml(project.location_name)
                : ""
            const customerHtml = project.partner_name
                ? this.escapeHtml(project.partner_name)
                : ""

            // Add highlight for search term
            const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, "gi")
            nameHtml = nameHtml.replace(regex, "<mark>$1</mark>")

            item.innerHTML = `
                <div>
                    <strong>${nameHtml}</strong>
                    ${locationHtml ? `<div class="location"><i class="fa fa-map-marker"></i> ${locationHtml}</div>` : ""}
                    ${customerHtml ? `<div class="location"><i class="fa fa-building"></i> ${customerHtml}</div>` : ""}
                    ${
                        project.latitude && project.longitude
                            ? `<div class="coordinates"><i class="fa fa-globe"></i> ${project.latitude.toFixed(4)}, ${project.longitude.toFixed(4)}</div>`
                            : '<div class="coordinates"><i class="fa fa-exclamation-triangle"></i> No coordinates</div>'
                    }
                </div>
            `

            item.onclick = () => {
                if (project.latitude && project.longitude) {
                    this.state.selectedProjectId = project.id
                    this.updateMapMarkers()
                    this.minimizeFilter()
                    this.zoomToProjectCenter(
                        project.latitude,
                        project.longitude,
                        project.name
                    )

                    // Clear search input and hide results
                    const searchInput = document.getElementById(
                        "project-search-input"
                    )
                    if (searchInput) searchInput.value = ""
                    const resultsDiv = document.getElementById(
                        "project-search-results"
                    )
                    if (resultsDiv) resultsDiv.style.display = "none"

                    // Update select dropdown
                    const selectElement =
                        document.getElementById("project-select")
                    if (selectElement) selectElement.value = project.id
                } else {
                    this.notification.add(
                        `Project "${project.name}" does not have valid coordinates`,
                        { type: "warning" }
                    )
                }
            }

            resultsList.appendChild(item)
        })

        // Add a "View all" option if there are more projects
        if (projects.length > 0) {
            const viewAllItem = document.createElement("div")
            viewAllItem.className = "project-search-item"
            viewAllItem.style.backgroundColor = "#f8f9fa"
            viewAllItem.style.textAlign = "center"
            viewAllItem.style.fontStyle = "italic"
            viewAllItem.innerHTML = `
                <div>
                    <i class="fa fa-list"></i> Found ${projects.length} project(s)
                </div>
            `
            viewAllItem.onclick = () => {
                const resultsDiv = document.getElementById(
                    "project-search-results"
                )
                if (resultsDiv) resultsDiv.style.display = "none"
            }
            resultsList.appendChild(viewAllItem)
        }
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

    setupFilterToggle() {
        const checkExist = setInterval(() => {
            const filterHeader = document.getElementById("filter-header")
            if (filterHeader) {
                clearInterval(checkExist)
                filterHeader.onclick = () => {
                    this.toggleFilter()
                }
            }
        }, 100)
    }

    toggleFilter() {
        const filterContent = document.getElementById("filter-content")
        const filterIcon = document.getElementById("filter-icon")

        if (filterContent && filterIcon) {
            if (this.isFilterMinimized) {
                filterContent.style.display = "block"
                filterIcon.className = "fa fa-chevron-up"
                this.isFilterMinimized = false
            } else {
                filterContent.style.display = "none"
                filterIcon.className = "fa fa-chevron-down"
                this.isFilterMinimized = true
            }
        }
    }

    minimizeFilter() {
        if (!this.isFilterMinimized) {
            const filterContent = document.getElementById("filter-content")
            const filterIcon = document.getElementById("filter-icon")

            if (filterContent && filterIcon) {
                filterContent.style.display = "none"
                filterIcon.className = "fa fa-chevron-down"
                this.isFilterMinimized = true
            }
        }
    }

    async loadProjects() {
        try {
            console.log("Loading projects...")
            const response = await fetch("/ara_project_maps_dashboard/data")
            const data = await response.json()

            // Debug: lihat task_count dari data pertama
            if (data.length > 0) {
                console.log("Sample project data:", data[0])
                console.log("Task count value:", data[0].task_count)
            }

            this.state.projects = data
            this.state.filteredProjects = data
            console.log(`Loaded ${this.state.projects.length} projects`)

            this.updateMapMarkers()
        } catch (error) {
            console.error("Error loading projects:", error)
            this.notification.add("Failed to load project data", {
                type: "danger",
            })
        } finally {
            this.state.loading = false
        }
    }
    setupCountrySearch() {
        const checkExist = setInterval(() => {
            const searchInput = document.getElementById("country-search")
            const selectElement = document.getElementById("country-filter")

            if (searchInput && selectElement && this.map) {
                clearInterval(checkExist)

                searchInput.oninput = event => {
                    const searchTerm = event.target.value.toLowerCase()
                    const options = selectElement.options

                    for (let i = 0; i < options.length; i++) {
                        const option = options[i]
                        if (option.value === "") continue

                        const countryName = option.textContent.toLowerCase()
                        if (countryName.includes(searchTerm)) {
                            option.style.display = ""
                        } else {
                            option.style.display = "none"
                        }
                    }

                    if (searchTerm === "") {
                        for (let i = 0; i < options.length; i++) {
                            options[i].style.display = ""
                        }
                    }
                }
            }
        }, 100)
    }

    setupProjectSelect() {
        const checkExist = setInterval(() => {
            const selectElement = document.getElementById("project-select")
            if (selectElement && this.map) {
                clearInterval(checkExist)

                selectElement.onchange = event => {
                    const projectId = event.target.value

                    if (projectId) {
                        const selectedOption = event.target.selectedOptions[0]
                        const lat = parseFloat(
                            selectedOption.getAttribute("data-lat")
                        )
                        const lon = parseFloat(
                            selectedOption.getAttribute("data-lon")
                        )
                        const projectName =
                            selectedOption.getAttribute("data-name")

                        if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
                            this.state.selectedProjectId = parseInt(projectId)
                            this.updateMapMarkers()
                            this.minimizeFilter()
                            setTimeout(() => {
                                this.zoomToProjectCenter(lat, lon, projectName)
                            }, 200)
                            const countryFilter =
                                document.getElementById("country-filter")
                            if (countryFilter) countryFilter.value = ""

                            // Clear search input
                            const searchInput = document.getElementById(
                                "project-search-input"
                            )
                            if (searchInput) searchInput.value = ""
                            const resultsDiv = document.getElementById(
                                "project-search-results"
                            )
                            if (resultsDiv) resultsDiv.style.display = "none"
                        } else {
                            this.notification.add(
                                `Project "${projectName}" does not have valid coordinates`,
                                {
                                    type: "warning",
                                }
                            )
                        }
                    } else {
                        this.clearProjectFilter()
                    }
                }
            }
        }, 100)
    }

    setupClearProjectFilter() {
        const checkExist = setInterval(() => {
            const clearBtn = document.getElementById("clear-project-filter")
            if (clearBtn) {
                clearInterval(checkExist)
                clearBtn.onclick = () => {
                    this.clearProjectFilter()
                }
            }
        }, 100)
    }

    clearProjectFilter() {
        this.state.selectedProjectId = null
        this.updateMapMarkers()

        const selectElement = document.getElementById("project-select")
        if (selectElement) selectElement.value = ""

        const searchInput = document.getElementById("project-search-input")
        if (searchInput) searchInput.value = ""

        const resultsDiv = document.getElementById("project-search-results")
        if (resultsDiv) resultsDiv.style.display = "none"

        this.notification.add("Showing all projects", { type: "info" })
        this.resetToDefaultView()
    }

    zoomToProjectCenter(lat, lon, projectName) {
        if (!this.map) return

        setTimeout(() => {
            this.map.invalidateSize()
            this.map.flyTo([lat, lon], 18, {
                animate: true,
                duration: 1.5,
            })

            setTimeout(() => {
                this.highlightSelectedMarker(lat, lon)

                const marker = this.markers.find(m => {
                    const markerLatLng = m.getLatLng()
                    return (
                        Math.abs(markerLatLng.lat - lat) < 0.0001 &&
                        Math.abs(markerLatLng.lng - lon) < 0.0001
                    )
                })

                if (marker) {
                    marker.openPopup()
                }
            }, 1600)
        }, 100)

        this.notification.add(`Displaying project: ${projectName}`, {
            type: "success",
            sticky: false,
        })
    }

    highlightSelectedMarker(lat, lon) {
        if (this.selectedMarker) {
            if (this.map) this.map.removeLayer(this.selectedMarker)
        }

        const circleIcon = window.L.divIcon({
            html: `<div style="background-color: #FF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFD700; box-shadow: 0 0 20px rgba(255, 215, 0, 0.9);"></div>`,
            iconSize: [30, 30],
            className: "highlight-marker",
        })

        this.selectedMarker = window.L.marker([lat, lon], {
            icon: circleIcon,
        }).addTo(this.map)

        setTimeout(() => {
            if (this.selectedMarker && this.map) {
                this.map.removeLayer(this.selectedMarker)
                this.selectedMarker = null
            }
        }, 8000)
    }

    setupClearHighlightButton() {
        const checkExist = setInterval(() => {
            const clearBtn = document.getElementById("clear-highlight")
            if (clearBtn && this.map) {
                clearInterval(checkExist)
                clearBtn.onclick = () => {
                    if (this.selectedMarker) {
                        this.map.removeLayer(this.selectedMarker)
                        this.selectedMarker = null
                    }
                    if (this.currentHighlight) {
                        this.map.removeLayer(this.currentHighlight)
                        this.currentHighlight = null
                    }
                    this.notification.add("Highlight removed", { type: "info" })
                }
            }
        }, 100)
    }

    setupResetButton() {
        const checkExist = setInterval(() => {
            const resetBtn = document.getElementById("reset-default-view")
            if (resetBtn && this.map) {
                clearInterval(checkExist)
                resetBtn.onclick = () => {
                    this.resetToDefaultView()
                    this.notification.add("Showing entire world", {
                        type: "success",
                    })
                    const filterSelect =
                        document.getElementById("country-filter")
                    if (filterSelect) filterSelect.value = ""

                    this.clearProjectFilter()

                    if (this.selectedMarker) {
                        this.map.removeLayer(this.selectedMarker)
                        this.selectedMarker = null
                    }
                }
            }
        }, 100)
    }

    setupCountryFilter() {
        const checkExist = setInterval(() => {
            const filterSelect = document.getElementById("country-filter")
            if (filterSelect && this.map) {
                clearInterval(checkExist)
                filterSelect.onchange = event => {
                    const selectedOptions = Array.from(
                        filterSelect.selectedOptions
                    )
                    const countryKeys = selectedOptions
                        .map(opt => opt.value)
                        .filter(v => v !== "")

                    if (
                        countryKeys.length === 1 &&
                        this.countries[countryKeys[0]]
                    ) {
                        this.clearProjectFilter()
                        this.zoomToCountry(countryKeys[0])
                        this.notification.add(
                            `Viewing country: ${this.countries[countryKeys[0]].name}`,
                            { type: "info" }
                        )
                    } else if (countryKeys.length > 1) {
                        this.zoomToMultipleCountries(countryKeys)
                    } else if (countryKeys.length === 0) {
                        this.resetToDefaultView()
                    }
                }
            }
        }, 100)
    }

    zoomToMultipleCountries(countryKeys) {
        if (!this.map || countryKeys.length === 0) return

        let minLat = 90,
            maxLat = -90,
            minLng = 180,
            maxLng = -180

        countryKeys.forEach(key => {
            const country = this.countries[key]
            if (country && country.bounds) {
                minLat = Math.min(minLat, country.bounds[0][0])
                maxLat = Math.max(maxLat, country.bounds[1][0])
                minLng = Math.min(minLng, country.bounds[0][1])
                maxLng = Math.max(maxLng, country.bounds[1][1])
            }
        })

        if (minLat !== 90 && maxLat !== -90) {
            const bounds = window.L.latLngBounds([
                [minLat, minLng],
                [maxLat, maxLng],
            ])
            this.map.fitBounds(bounds, {
                padding: [50, 50],
                animate: true,
                duration: 1.0,
            })
            this.notification.add(
                `Displaying ${countryKeys.length} selected countries`,
                { type: "info" }
            )
        }
    }

    zoomToCountry(countryKey) {
        const country = this.countries[countryKey]
        if (!country || !this.map) return

        this.map.invalidateSize()

        if (country.bounds) {
            const bounds = window.L.latLngBounds(country.bounds)
            this.map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: country.zoom || 8,
                animate: true,
                duration: 1.0,
            })
        } else if (country.center && country.zoom) {
            this.map.setView(country.center, country.zoom, {
                animate: true,
                duration: 1.0,
            })
        }

        this.highlightCountryBounds(countryKey)
    }

    highlightCountryBounds(countryKey) {
        if (this.currentHighlight) {
            this.map.removeLayer(this.currentHighlight)
        }

        const country = this.countries[countryKey]
        if (country && country.bounds && this.map) {
            const bounds = window.L.latLngBounds(country.bounds)
            this.currentHighlight = window.L.rectangle(bounds, {
                color: "#FFD700",
                weight: 3,
                fill: true,
                fillColor: "#FFD700",
                fillOpacity: 0.1,
                dashArray: "10, 10",
            }).addTo(this.map)

            setTimeout(() => {
                if (this.currentHighlight) {
                    this.map.removeLayer(this.currentHighlight)
                    this.currentHighlight = null
                }
            }, 3000)
        }
    }

    resetToDefaultView() {
        if (this.map) {
            this.map.invalidateSize()
            const defaultCenter = [20.0, 0.0]
            const defaultZoom = 2
            this.map.flyTo(defaultCenter, defaultZoom, {
                animate: true,
                duration: 1.0,
            })

            if (this.currentHighlight) {
                this.map.removeLayer(this.currentHighlight)
                this.currentHighlight = null
            }
        }
    }

    initMap() {
        const mapElement = document.getElementById("project-map")
        if (!mapElement) {
            console.error("Map element not found")
            return
        }

        const waitForLeaflet = setInterval(() => {
            if (window.L && window.L.map) {
                clearInterval(waitForLeaflet)

                // Pastikan container sudah memiliki ukuran yang benar
                setTimeout(() => {
                    const defaultCenter = [20.0, 0.0]
                    const defaultZoom = 2

                    this.map = window.L.map("project-map").setView(
                        defaultCenter,
                        defaultZoom
                    )

                    window.L.tileLayer(
                        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        {
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | World Map',
                            maxZoom: 19,
                            minZoom: 2,
                        }
                    ).addTo(this.map)

                    window.L.control
                        .scale({
                            metric: true,
                            imperial: false,
                            position: "bottomleft",
                        })
                        .addTo(this.map)
                    window.L.control
                        .zoom({ position: "topright" })
                        .addTo(this.map)

                    // Panggil invalidateSize setelah map diinisialisasi
                    setTimeout(() => {
                        this.map.invalidateSize()
                    }, 100)

                    this.updateMapMarkers()
                    this.setupCountryFilter()
                    this.setupCountrySearch()
                    this.setupResetButton()
                    this.setupProjectRealTimeSearch()
                    this.setupProjectSelect()
                    this.setupClearHighlightButton()
                    this.setupFilterToggle()
                    this.setupClearProjectFilter()
                }, 50)
            }
        }, 100)
    }

    updateMapMarkers() {
        if (!this.map) return

        this.markers.forEach(marker => {
            if (this.map) this.map.removeLayer(marker)
        })
        this.markers = []

        let projectsToShow = this.state.projects
        if (this.state.selectedProjectId) {
            projectsToShow = this.state.projects.filter(
                p => p.id === this.state.selectedProjectId
            )
        }

        projectsToShow.forEach(project => {
            if (project.latitude && project.longitude && this.map) {
                const customIcon = window.L.divIcon({
                    html: `<div style="background-color: #FF0000; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [18, 18],
                    className: "custom-marker",
                })

                const marker = window.L.marker(
                    [project.latitude, project.longitude],
                    { icon: customIcon }
                ).addTo(this.map)

                // Ambil task_count, pastikan angka
                const taskCount = project.task_count || 0

                // Tampilkan task count dengan badge
                const taskBadgeColor = taskCount > 0 ? "#28a745" : "#6c757d"
                const taskText =
                    taskCount > 0
                        ? `${taskCount} Task${taskCount !== 1 ? "s" : ""}`
                        : "No Tasks"

                const popupContent = `
                    <div style="min-width: 250px; font-family: Arial, sans-serif;">
                        <h5 style="margin: 0 0 10px 0;">
                            <strong>${this.escapeHtml(project.name)}</strong>
                        </h5>
                        <div style="margin-bottom: 8px;">
                            <strong><i class="fa fa-user"></i> Customer:</strong><br/>
                            ${this.escapeHtml(project.partner_name || "-")}
                        </div>
                        <div style="margin-bottom: 8px;">
                            <strong><i class="fa fa-map-marker"></i> Location:</strong><br/>
                            ${this.escapeHtml(project.location_name || "-")}
                        </div>
                        <div style="margin-bottom: 8px;">
                            <strong><i class="fa fa-tasks"></i> Task:</strong><br/>
                            <span style="display: inline-block; background-color: ${taskBadgeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">
                                ${taskText}
                            </span>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <strong><i class="fa fa-globe"></i> Coordinates:</strong><br/>
                            <span style="font-size: 11px; color: #666;">${project.latitude.toFixed(6)}, ${project.longitude.toFixed(6)}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" 
                                onclick="window.location.href='/web#id=${project.id}&model=project.project&view=form'"
                                style="width: 100%; margin-top: 5px;">
                            <i class="fa fa-external-link"></i> Open Project
                        </button>
                    </div>
                `

                marker.bindPopup(popupContent, {
                    maxWidth: 350,
                    minWidth: 280,
                })

                this.markers.push(marker)
            }
        })
    }

    escapeHtml(str) {
        if (!str) return ""
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
    }
}

// Register the action
registry
    .category("actions")
    .add("ara_project_maps_dashboard_action", ProjectMapDashboard)
