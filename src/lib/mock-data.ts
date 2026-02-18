
import type { CarbonCredit, Transaction, PortfolioItem, ClaimHistoryItem, Project } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { calculateProjectMetrics } from './carbon-matrix';

// This file contains mock data for the prototype.
// In a real application, this would come from a database.

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return {
    url: image?.imageUrl ?? 'https://picsum.photos/seed/1/600/400',
    hint: image?.imageHint ?? 'placeholder',
  };
};


const baseProjects: Omit<Project, 'id'>[] = [
    {
        name: 'Gujarat Wind Power Project',
        projectType: 'Renewable Energy',
        country: 'India',
        vintageYear: 2023,
        availableTons: 50000,
        description: 'A large-scale wind farm in Gujarat aimed at generating clean energy and reducing reliance on fossil fuels.',
        methodology: 'Verra',
        developerId: 'dev-123',
        status: 'Verified'
    },
    {
        name: 'Sundarbans Reforestation Initiative',
        projectType: 'Reforestation',
        country: 'India',
        vintageYear: 2024,
        availableTons: 80000,
        description: 'Focused on restoring mangrove forests in the Sundarbans delta, this project helps protect coastal communities.',
        methodology: 'Gold Standard',
        developerId: 'dev-456',
        status: 'Verified'
    },
    {
        name: 'Delhi Methane Capture',
        projectType: 'Methane Capture',
        country: 'India',
        vintageYear: 2023,
        availableTons: 35000,
        description: 'Captures methane gas from a major landfill site in Delhi and converts it into electricity.',
        methodology: 'BEE India',
        developerId: 'dev-789',
        status: 'Under Validation'
    },
    {
        name: 'Rajasthan Solar Park',
        projectType: 'Renewable Energy',
        country: 'India',
        vintageYear: 2022,
        availableTons: 120000,
        description: 'One of the largest solar parks in India, located in the Thar Desert region of Rajasthan.',
        methodology: 'UNFCCC (CDM)',
        developerId: 'dev-101',
        status: 'Verified'
    },
    {
        name: 'Climeworks Orca DAC',
        projectType: 'Direct Air Capture',
        country: 'USA',
        vintageYear: 2024,
        availableTons: 4000,
        description: 'A cutting-edge Direct Air Capture facility that removes CO2 directly from the atmosphere.',
        methodology: 'Puro.earth',
        developerId: 'dev-112',
        status: 'Verified'
    },
    {
        name: 'Olkaria Geothermal Project',
        projectType: 'Geothermal',
        country: 'Kenya',
        vintageYear: 2023,
        availableTons: 75000,
        description: 'Utilizes steam from geothermal reservoirs in the Great Rift Valley to generate clean electricity.',
        methodology: 'Gold Standard',
        developerId: 'dev-113',
        status: 'Verified'
    },
    {
        name: 'Three Gorges Dam Project',
        projectType: 'Hydroelectric',
        country: 'Global',
        vintageYear: 2022,
        availableTons: 250000,
        description: 'Large-scale hydroelectric power generation from a major global river system.',
        methodology: 'UNFCCC (CDM)',
        developerId: 'dev-114',
        status: 'Verified'
    },
    {
        name: 'Aravalli Reforestation Project',
        projectType: 'Reforestation',
        country: 'India',
        vintageYear: 2025,
        availableTons: 60000,
        description: 'A community-led project to reforest the degraded Aravalli hills, a critical biodiversity hotspot.',
        methodology: 'Verra',
        developerId: 'dev-115',
        status: 'Verified'
    }
];

export const carbonCredits: CarbonCredit[] = baseProjects.map((project, index) => {
    const projectId = `proj-00${index + 1}`;
    // Use the new carbon-matrix engine for mock data as well
    const { finalIntegrityScore, dynamicPrice } = calculateProjectMetrics(project as Project);

    const projectTypeToImageId: Record<string, string> = {
        'Renewable Energy': 'solar-farm-india',
        'Reforestation': 'sundarbans-mangrove',
        'Methane Capture': 'methane-capture-india',
        'Direct Air Capture': 'usa-dac',
        'Geothermal': 'kenya-geothermal',
        'Hydroelectric': 'hydro-power'
    };
    
    let imageId = projectTypeToImageId[project.projectType];

    // Specific overrides for different projects of the same type
    if (project.name.includes('Wind Power')) {
        imageId = 'wind-turbine-india';
    } else if (project.name.includes('Aravalli')) {
        imageId = 'reforestation-project';
    }
    
    const image = getImage(imageId);
    
    const qualityMetricsBase = { 
        additionality: Math.floor(Math.random() * 21) + 75,
        permanence: Math.floor(Math.random() * 21) + 80,
        leakage: Math.floor(Math.random() * 31) + 65,
        mrv: Math.floor(Math.random() * 21) + 78,
        registryCompliance: 95,
        caStatus: Math.random() > 0.4 ? 100 : 0,
    };

    return {
        id: projectId,
        name: project.name,
        projectType: project.projectType as CarbonCredit['projectType'],
        origin: project.country,
        price: dynamicPrice,
        vintageYear: project.vintageYear,
        availableTons: project.availableTons,
        imageUrl: image.url,
        imageHint: image.hint,
        description: project.description.substring(0, 100) + '...',
        authority: project.methodology,
        verificationStatus: project.status,
        fullDescription: project.description,
        qualityMetrics: {
            ...qualityMetricsBase,
            integrityScore: finalIntegrityScore,
        }
    };
});


export const userPortfolio: PortfolioItem[] = [
    { creditId: 'proj-001', tons: 500 },
    { creditId: 'proj-004', tons: 1200 },
];

export const transactions: Transaction[] = [
  {
    txHash: '0xabc123def456',
    action: 'ISSUED',
    creditId: 'proj-001-v2023',
    from: 'BCX Registry',
    to: 'Gujarat Wind Power Ltd.',
    timestamp: '2024-05-20T10:00:00Z',
    amountTons: 50000,
  },
  {
    txHash: '0x123abc456def',
    action: 'SOLD',
    creditId: 'proj-001-v2023',
    from: 'Gujarat Wind Power Ltd.',
    to: 'Reliance Industries',
    timestamp: '2024-05-21T14:30:00Z',
    amountTons: 10000,
  },
  {
    txHash: '0x789def123abc',
    action: 'RETIRED',
    creditId: 'proj-001-v2023',
    from: 'Reliance Industries',
    to: 'Retired',
    timestamp: '2024-05-22T09:00:00Z',
    amountTons: 10000,
  },
  {
    txHash: '0xdef456ghi789',
    action: 'ISSUED',
    creditId: 'proj-002-v2024',
    from: 'BCX Registry',
    to: 'Sundarbans Reforestation NGO',
    timestamp: '2024-05-23T11:00:00Z',
    amountTons: 80000,
  },
  {
    txHash: '0x456jkl789mno',
    action: 'SOLD',
    creditId: 'proj-002-v2024',
    from: 'Sundarbans Reforestation NGO',
    to: 'Tata Steel',
    timestamp: '2024-05-24T18:00:00Z',
    amountTons: 25000,
  },
  {
    txHash: '0xabcde12345',
    action: 'RETIRED',
    creditId: 'proj-002-v2024',
    from: 'Tata Steel',
    to: 'Retired',
    timestamp: '2024-06-01T12:00:00Z',
    amountTons: 5000,
  },
  {
    txHash: '0x5a7b9c2d1e0f',
    action: 'ISSUED',
    creditId: 'proj-004-v2022',
    from: 'BCX Registry',
    to: 'Rajasthan Solar Corp.',
    timestamp: '2024-05-25T08:00:00Z',
    amountTons: 120000,
  },
  {
    txHash: '0x6b8c0d3e2f1a',
    action: 'SOLD',
    creditId: 'proj-004-v2022',
    from: 'Rajasthan Solar Corp.',
    to: 'Infosys Ltd.',
    timestamp: '2024-05-26T12:00:00Z',
    amountTons: 40000,
  },
  {
    txHash: '0x7c9d1e4f3a2b',
    action: 'RETIRED',
    creditId: 'proj-004-v2022',
    from: 'Infosys Ltd.',
    to: 'Retired',
    timestamp: '2024-05-27T16:45:00Z',
    amountTons: 40000,
  },
];

export const claimHistory: ClaimHistoryItem[] = [
    {
        id: 'claim-001',
        projectName: 'Gujarat Wind Power Project',
        tons: 1000,
        claimDate: '2024-04-15',
        certificateId: 'cert-gwp-001'
    },
]
