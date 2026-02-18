
import type { Project } from '@/lib/types';

type MetricsResult = {
    finalIntegrityScore: number;
    dynamicPrice: number;
};

/**
 * Calculates the integrity score and final price for a carbon offset project based on the World-Class Matrix.
 * @param project - The project data to be evaluated.
 * @returns An object containing the calculated finalIntegrityScore and dynamicPrice.
 */
export function calculateProjectMetrics(project: Project): MetricsResult {
    try {
        // A. Integrity Score Calculation
        let additionalityScore = 0;
        let permanenceScore = 0;

        // Additionality (40%)
        if (project.projectType === 'Reforestation') {
            additionalityScore = 98;
        } else if (['Renewable Energy', 'Solar', 'Wind', 'Geothermal', 'Hydroelectric'].includes(project.projectType)) {
            additionalityScore = 70;
        } else {
            additionalityScore = 75; // Default for others like Methane Capture
        }

        // Permanence (30%)
        const techBasedTypes = ['Direct Air Capture', 'Geothermal', 'Renewable Energy', 'Solar', 'Wind', 'Hydroelectric', 'Methane Capture'];
        if (techBasedTypes.includes(project.projectType)) {
            permanenceScore = 95;
        } else if (project.projectType === 'Reforestation') {
            permanenceScore = 85;
        } else {
            permanenceScore = 75; // Default
        }

        // MRV Quality (30%) - Simulated
        const mrvQuality = Math.floor(Math.random() * (96 - 88 + 1)) + 88;

        const finalIntegrityScore = Math.round(
            (additionalityScore * 0.40) +
            (permanenceScore * 0.30) +
            (mrvQuality * 0.30)
        );

        // B. Global Pricing Model
        let basePrice = 0;
        switch (project.projectType) {
            case 'Reforestation':
                basePrice = 28;
                break;
            case 'Methane Capture':
                basePrice = 18;
                break;
            case 'Solar':
            case 'Renewable Energy': // Assuming Renewable Energy might default to Solar's price
                basePrice = 12;
                break;
            case 'Wind':
                basePrice = 14;
                break;
            default:
                basePrice = 15; // Default for others like Geothermal, Hydro, DAC
        }

        // Quality Premium
        let qualityPremium = 0;
        if (finalIntegrityScore > 80) {
            const pointsAbove80 = finalIntegrityScore - 80;
            qualityPremium = pointsAbove80 * 0.50; // $0.50 for every point above 80
        }

        // Vintage Modifier
        const referenceYear = 2026;
        const yearDifference = Math.max(0, project.vintageYear - 2022); // Comparing to a baseline
        const vintageModifier = (project.vintageYear > 2022) ? (referenceYear - project.vintageYear) * 1.00 : 0;
        
        const priceBeforeVintage = basePrice + qualityPremium;
        // The vintage modifier logic is a bit ambiguous, interpreting as a bonus for newer years.
        const vintageBonus = (referenceYear - project.vintageYear) > 0 ? (referenceYear - project.vintageYear) * 1.00 : 0;


        const dynamicPrice = parseFloat((basePrice + qualityPremium + vintageBonus).toFixed(2));

        return { finalIntegrityScore, dynamicPrice };
    } catch (error) {
        console.error("Error in carbon-matrix calculation:", error);
        // Error Guard: Fallback logic
        return { finalIntegrityScore: 75, dynamicPrice: 15.00 };
    }
}
