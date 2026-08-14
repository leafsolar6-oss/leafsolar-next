import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = { title: 'Solar Installation Policy', description: 'Leaf Solar site-assessment, project-scope and installation-process information.', robots: { index: true, follow: true }, alternates: { canonical: '/solar-installation-policy' } };

export default function SolarInstallationPolicyPage() {
  return <PolicyPage eyebrow="Solar projects" title="Solar installation policy" intro="Solar projects depend on site conditions and an agreed written scope. Calculator results and catalogue packages are planning aids, not a final site assessment or performance guarantee." sections={[
    { title: 'Before work is confirmed', bullets: ['Leaf Solar may need load information, site details, photographs or an on-site assessment before confirming the system and installation scope.', 'The written quotation should identify the equipment, quantities, installation work, price and any assumptions that apply.', 'A requested change to equipment, wiring route, mounting location, address or project scope may require a revised quotation and schedule.', 'Any access, approvals or third-party work needed for the site should be identified before installation.'] },
    { title: 'Installation and handover', bullets: ['The customer or an authorised representative should provide safe, agreed access to the installation location.', 'Work timing is confirmed for the specific project; no universal completion time is promised on this page.', 'The final handover should identify the installed equipment and any operating, safety or maintenance guidance provided for that system.', 'Any product or workmanship warranty must be stated for the particular project rather than inferred from this policy.'] },
    { title: 'Calculator and energy expectations', paragraphs: ['The website solar calculator is an estimate based on customer inputs and general assumptions. Actual energy use, sunlight, weather, battery settings, equipment condition and future load changes can affect results. Leaf Solar should confirm system sizing for the site before the customer relies on an estimate.'] },
  ]} />;
}
