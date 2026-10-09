// Cloud dashboard — PROTOTYPE DATA.
// Nothing here is fetched from live AWS/Azure/GCP APIs. All values are
// deterministic simulations consistent with a 500-person enterprise
// running ~60 projects. This is clearly labelled as simulated on the
// frontend. Do not use these numbers for capacity planning.
import { prisma } from '../config/prisma';

export async function getCloudOverview() {
  const [projectCount, deploymentCount] = await Promise.all([
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.deployment.count({ where: { status: 'SUCCESS' } }),
  ]);

  // Simulated cloud footprint — deterministic, derived from project count.
  const awsComputeHours = projectCount * 2400;
  const azureComputeHours = Math.round(projectCount * 1100);
  const gcpComputeHours = Math.round(projectCount * 600);

  return {
    label: 'Prototype Simulation',
    providers: [
      {
        provider: 'AWS',
        region: 'ap-south-1',
        services: [
          { name: 'EC2', instances: Math.round(projectCount * 1.8), vcpu: Math.round(projectCount * 7.2) },
          { name: 'RDS', instances: Math.round(projectCount * 0.6), vcpu: Math.round(projectCount * 2.4) },
          { name: 'S3', buckets: Math.round(projectCount * 0.4), sizeGb: Math.round(projectCount * 380) },
          { name: 'EKS', clusters: Math.round(projectCount * 0.25), nodes: Math.round(projectCount * 1.2) },
        ],
        monthlyCost: Math.round(projectCount * 48000),
        environment: 'PRODUCTION',
      },
      {
        provider: 'Azure',
        region: 'centralindia',
        services: [
          { name: 'Virtual Machines', instances: Math.round(projectCount * 0.9) },
          { name: 'AKS', clusters: Math.round(projectCount * 0.15), nodes: Math.round(projectCount * 0.7) },
          { name: 'Azure SQL', databases: Math.round(projectCount * 0.3) },
        ],
        monthlyCost: Math.round(projectCount * 22000),
        environment: 'PRODUCTION',
      },
      {
        provider: 'GCP',
        region: 'asia-south1',
        services: [
          { name: 'Compute Engine', instances: Math.round(projectCount * 0.5) },
          { name: 'GKE', clusters: Math.round(projectCount * 0.1), nodes: Math.round(projectCount * 0.4) },
          { name: 'BigQuery', datasets: Math.round(projectCount * 0.2) },
        ],
        monthlyCost: Math.round(projectCount * 12000),
        environment: 'ANALYTICS',
      },
    ],
    totals: {
      monthlyCloudSpend: Math.round(projectCount * 82000),
      activeDeployments: deploymentCount,
      activeProjectsUsingCloud: projectCount,
      computeHoursMonth: awsComputeHours + azureComputeHours + gcpComputeHours,
    },
  };
}