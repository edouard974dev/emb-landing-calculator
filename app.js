// EMB-135/145 Landing Distance Calculator
// Basé sur le document Embraer GP-7924

class LandingDistanceCalculator {
    constructor() {
        this.data = null;
        this.initializeApp();
    }

    async initializeApp() {
        await this.loadData();
        this.setupEventListeners();
        this.setupPWA();
    }

    async loadData() {
        try {
            const response = await fetch('data.json');
            this.data = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('landing-form');
        const thrustReverserSelect = document.getElementById('thrust-reverser');
        const reverserInopGroup = document.getElementById('reverser-inop-group');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateLandingDistance();
        });

        form.addEventListener('reset', () => {
            document.getElementById('results').style.display = 'none';
        });

        thrustReverserSelect.addEventListener('change', (e) => {
            if (e.target.value === 'with') {
                reverserInopGroup.style.display = 'block';
            } else {
                reverserInopGroup.style.display = 'none';
                document.getElementById('reverser-inop').value = '0';
            }
        });
    }

    setupPWA() {
        let deferredPrompt;
        const installStatus = document.getElementById('install-status');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installStatus.innerHTML = '<button onclick="installApp()">Installer l\'app</button>';
        });

        window.installApp = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((result) => {
                    if (result.outcome === 'accepted') {
                        installStatus.textContent = 'Application installée!';
                    }
                    deferredPrompt = null;
                });
            }
        };

        window.addEventListener('appinstalled', () => {
            installStatus.textContent = 'Application installée!';
        });
    }

    calculateLandingDistance() {
        const formData = this.getFormData();
        
        if (!this.validateInputs(formData)) {
            return;
        }

        const tableData = this.getTableData(formData);
        if (!tableData) {
            alert('Configuration non trouvée dans les données');
            return;
        }

        const result = this.performCalculation(formData, tableData);
        this.displayResults(result, formData);
    }

    getFormData() {
        return {
            aircraftModel: document.getElementById('aircraft-model').value,
            thrustReverser: document.getElementById('thrust-reverser').value,
            flapSetting: document.getElementById('flap-setting').value,
            iceCondition: document.getElementById('ice-condition').value,
            catApproach: document.getElementById('cat-approach').value,
            rwycc: document.getElementById('rwycc').value,
            landingWeight: parseFloat(document.getElementById('landing-weight').value),
            pressureAltitude: parseFloat(document.getElementById('pressure-altitude').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            windSpeed: parseFloat(document.getElementById('wind-speed').value),
            windDirection: document.getElementById('wind-direction').value,
            runwaySlope: parseFloat(document.getElementById('runway-slope').value),
            slopeDirection: document.getElementById('slope-direction').value,
            vrefAdditive: parseFloat(document.getElementById('vref-additive').value),
            reverserInop: parseInt(document.getElementById('reverser-inop').value) || 0
        };
    }

    validateInputs(formData) {
        // Validation de base
        if (formData.landingWeight < 12000 || formData.landingWeight > 22000) {
            alert('Masse d\'atterrissage doit être entre 12000 et 22000 kg');
            return false;
        }
        
        if (Math.abs(formData.temperature) > 50) {
            alert('Température ISA doit être entre -50°C et +50°C');
            return false;
        }
        
        return true;
    }

    getTableData(formData) {
        const key = this.buildTableKey(formData);
        return this.data[key];
    }

    buildTableKey(formData) {
        const reverser = formData.thrustReverser === 'with' ? 'WITH' : 'WITHOUT';
        const ice = formData.iceCondition === 'with' ? 'WITH' : 'WITHOUT';
        
        return `${formData.aircraftModel}_${reverser}_REVERSER_${formData.catApproach}_FLAP_${formData.flapSetting}_${ice}_ICE`;
    }

    performCalculation(formData, tableData) {
        const rwyccData = tableData.rwycc[formData.rwycc];
        if (!rwyccData) {
            throw new Error('RWYCC non trouvé');
        }

        let distance = rwyccData.ref_distance;
        const steps = [];
        
        steps.push({
            description: `Distance de référence (RWYCC ${formData.rwycc})`,
            value: distance,
            unit: 'm'
        });

        // Correction poids (si pas en surpoids)
        if (formData.landingWeight <= 18000) {
            const weightDiff = (18000 - formData.landingWeight) / 1000;
            const weightCorrection = weightDiff * rwyccData.corrections.weight_below;
            distance += weightCorrection;
            steps.push({
                description: `Correction poids (${formData.landingWeight} kg, ${weightDiff.toFixed(1)}k sous référence)`,
                value: Math.round(weightCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        } else if (formData.landingWeight > 18000) {
            const weightDiff = (formData.landingWeight - 18000) / 1000;
            const weightCorrection = weightDiff * rwyccData.corrections.weight_above;
            distance += weightCorrection;
            steps.push({
                description: `Correction poids (${formData.landingWeight} kg, ${weightDiff.toFixed(1)}k au-dessus référence)`,
                value: Math.round(weightCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction altitude
        if (formData.pressureAltitude !== 0) {
            const altitudeFeet = formData.pressureAltitude / 1000;
            const altitudeCorrection = altitudeFeet * rwyccData.corrections.altitude;
            distance += altitudeCorrection;
            steps.push({
                description: `Correction altitude (${formData.pressureAltitude} ft)`,
                value: Math.round(altitudeCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction température
        if (formData.temperature !== 0) {
            const tempGroups = Math.abs(formData.temperature) / 5;
            let tempCorrection;
            if (formData.temperature < 0) {
                tempCorrection = -tempGroups * rwyccData.corrections.temp_below_isa;
            } else {
                tempCorrection = tempGroups * rwyccData.corrections.temp_above_isa;
            }
            distance += tempCorrection;
            steps.push({
                description: `Correction température (ISA ${formData.temperature > 0 ? '+' : ''}${formData.temperature}°C)`,
                value: Math.round(tempCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction vent
        if (formData.windSpeed !== 0) {
            const windGroups = formData.windSpeed / 5;
            let windCorrection;
            if (formData.windDirection === 'headwind') {
                windCorrection = -windGroups * rwyccData.corrections.headwind;
            } else {
                windCorrection = windGroups * rwyccData.corrections.tailwind;
            }
            distance += windCorrection;
            steps.push({
                description: `Correction vent (${formData.windSpeed} kt ${formData.windDirection === 'headwind' ? 'face' : 'arrière'})`,
                value: Math.round(windCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction pente
        if (formData.runwaySlope !== 0) {
            let slopeCorrection;
            if (formData.slopeDirection === 'uphill') {
                slopeCorrection = formData.runwaySlope * rwyccData.corrections.uphill;
            } else {
                slopeCorrection = -formData.runwaySlope * rwyccData.corrections.downhill;
            }
            distance += slopeCorrection;
            steps.push({
                description: `Correction pente (${formData.runwaySlope}% ${formData.slopeDirection === 'uphill' ? 'montante' : 'descendante'})`,
                value: Math.round(slopeCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction vitesse VREF
        if (formData.vrefAdditive > 0) {
            const vrefGroups = formData.vrefAdditive / 5;
            const vrefCorrection = vrefGroups * rwyccData.corrections.vref_additive;
            distance += vrefCorrection;
            steps.push({
                description: `Correction vitesse (VREF + ${formData.vrefAdditive} kt)`,
                value: Math.round(vrefCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction inverseurs inopérants
        if (formData.thrustReverser === 'with' && formData.reverserInop > 0) {
            const reverserCorrection = formData.reverserInop * rwyccData.corrections.reverser_inop;
            distance += reverserCorrection;
            steps.push({
                description: `Correction inverseurs inopérants (${formData.reverserInop})`,
                value: Math.round(reverserCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        // Correction surpoids (si applicable)
        if (formData.landingWeight > 18000 && tableData.overweight_correction) {
            const overweightDiff = (formData.landingWeight - 18000) / 1000;
            const overweightCorrection = overweightDiff * tableData.overweight_correction;
            distance += overweightCorrection;
            steps.push({
                description: `Correction surpoids (${overweightDiff.toFixed(1)}k au-dessus 18000 kg)`,
                value: Math.round(overweightCorrection),
                running_total: Math.round(distance),
                unit: 'm'
            });
        }

        return {
            finalDistance: Math.round(distance),
            steps: steps
        };
    }

    displayResults(result, formData) {
        const resultsDiv = document.getElementById('results');
        const finalDistanceSpan = document.getElementById('final-distance');
        const calculationSteps = document.getElementById('calculation-steps');

        finalDistanceSpan.textContent = `${result.finalDistance} m`;

        let stepsHtml = '<table class="calculation-table">';
        stepsHtml += '<tr><th>Étape</th><th>Correction</th><th>Total</th></tr>';
        
        result.steps.forEach(step => {
            stepsHtml += `<tr>`;
            stepsHtml += `<td>${step.description}</td>`;
            stepsHtml += `<td>${step.value >= 0 ? '+' : ''}${step.value || step.value === 0 ? step.value : '-'} ${step.unit}</td>`;
            stepsHtml += `<td>${step.running_total || step.value} m</td>`;
            stepsHtml += `</tr>`;
        });
        
        stepsHtml += '</table>';
        calculationSteps.innerHTML = stepsHtml;

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new LandingDistanceCalculator();
});
