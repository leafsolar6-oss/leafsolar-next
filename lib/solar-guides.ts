export type SolarGuideSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type SolarGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  eyebrow: string;
  published: string;
  updated: string;
  readTime: string;
  introduction: string[];
  sections: SolarGuideSection[];
  takeaway: string;
  relatedLinks: Array<{ href: string; label: string }>;
};

export const solarGuides: SolarGuide[] = [
  {
    slug: 'how-to-size-solar-system-nigeria',
    title: 'How to Size a Solar System for Your Home in Nigeria',
    shortTitle: 'How to size a home solar system',
    description: 'A practical guide to estimating appliance loads, daily energy use, inverter demand, battery storage and solar-panel capacity before requesting a final system design.',
    eyebrow: 'Solar sizing guide',
    published: '2026-08-14',
    updated: '2026-08-14',
    readTime: '9 min read',
    introduction: [
      'A useful solar-system estimate starts with the appliances you want to run, not with a package name alone. Two homes can own similar appliances but need different systems because their operating hours, simultaneous use and desired backup time are different.',
      'The steps below help you prepare a realistic load list and understand the decisions behind a solar quotation. They are a planning guide rather than a final engineering design: site conditions, actual equipment ratings and product-specific limits still need to be checked.',
    ],
    sections: [
      {
        heading: '1. List the appliances the system must power',
        paragraphs: [
          'Write down every appliance that you expect to use during an outage or from solar energy. Separate essential loads—such as lighting, fans, internet equipment and a refrigerator—from optional high-demand loads such as air conditioners, electric kettles, irons, pumps and cooking appliances.',
          'Use the rating plate, manual or manufacturer information for each appliance where possible. A generic estimate can help with early planning, but the rating on the actual appliance is a better basis for a quotation.',
        ],
        bullets: [
          'Record the appliance name and rated watts.',
          'Record how many of each appliance will run.',
          'Estimate the hours of use in a typical day.',
          'Mark appliances likely to run at the same time.',
          'Identify motors, compressors and pumps that may need extra starting power.',
        ],
      },
      {
        heading: '2. Calculate daily energy in watt-hours',
        paragraphs: [
          'Power and energy are related but different. Watts describe the power an appliance needs at a moment in time. Watt-hours estimate how much energy it uses over a period. Multiply watts by quantity and daily operating hours for each load, then add the results.',
          'For example, a 10-watt lamp used for five hours represents 50 watt-hours of daily energy. Real consumption can vary because some appliances cycle on and off, change operating modes or draw different power under different conditions.',
        ],
      },
      {
        heading: '3. Check simultaneous demand and starting surge',
        paragraphs: [
          'The inverter must support the combination of loads that may operate together. This simultaneous demand can be very different from the daily energy total. A home may use a moderate amount of energy across the day but still create a high short-term demand when several appliances are switched on together.',
          'Refrigerators, air conditioners, pumps and other motor-driven equipment can draw more power when starting than when running normally. The relevant starting requirement depends on the appliance and inverter, so it should be confirmed from product information rather than assumed from a universal multiplier.',
        ],
      },
      {
        heading: '4. Decide how much backup time you need',
        paragraphs: [
          'Battery storage depends on both the energy demand and the period you want the battery to support it. Decide whether you need short backup for essential loads, overnight support, or a broader daytime-and-night plan. Reducing optional loads during outages can substantially change the storage requirement.',
          'Battery nameplate capacity is not the same as energy that should always be treated as usable. Battery chemistry, manufacturer operating limits, inverter settings, age, temperature and system losses matter. Use the applicable product documentation when converting a battery rating into an operating estimate.',
        ],
      },
      {
        heading: '5. Consider the solar array and the site',
        paragraphs: [
          'Solar panels must replenish the energy used while also working within the inverter and charge-controller limits. Panel output changes with sunlight, temperature, orientation, shading, dirt and system losses. A roof with morning or afternoon shade may perform differently from an unobstructed roof even when both use the same panel model.',
          'A site review can check usable mounting space, roof or ground conditions, cable routes, equipment location, ventilation, distribution-board work and earthing requirements. These details can affect both the design and the written scope.',
        ],
      },
      {
        heading: '6. Leave room for real-world conditions and future loads',
        paragraphs: [
          'A design that only works when every assumption is perfect can be difficult to live with. Discuss realistic operating margins, seasonal conditions and any appliances you plan to add. Future air conditioners, pumps, freezers or office equipment should not be hidden from the sizing conversation.',
          'At the same time, buying capacity without a clear load plan is not automatically better. A measured load list helps the system designer explain where capacity is needed and which usage changes could reduce the final requirement.',
        ],
      },
      {
        heading: 'What to send when requesting a quotation',
        bullets: [
          'Your appliance list, quantities and rating-plate watts where available.',
          'Expected hours of use and which loads must work overnight.',
          'The loads likely to start or run together.',
          'Your preferred essential and optional loads.',
          'Site location and any known roof, shading or access information.',
          'Photographs or a site-assessment appointment if requested.',
        ],
      },
    ],
    takeaway: 'Start with an honest load audit, then confirm simultaneous demand, backup time, battery operating limits, solar conditions and the installation site. Leaf Solar’s calculator can help organise an early estimate, but the final system should be confirmed against actual appliance and site information.',
    relatedLinks: [
      { href: '/solar-calculator', label: 'Use the solar load calculator' },
      { href: '/packages', label: 'Compare solar package starting points' },
      { href: '/solar-installation-ibadan', label: 'Solar installation in Ibadan' },
    ],
  },
  {
    slug: 'lithium-vs-tubular-battery-nigeria',
    title: 'Lithium vs Tubular Batteries for Solar Systems in Nigeria',
    shortTitle: 'Lithium vs tubular solar batteries',
    description: 'Compare lithium and tubular battery considerations for a solar system, including usable energy, maintenance, installation space, compatibility and total project fit.',
    eyebrow: 'Battery comparison',
    published: '2026-08-14',
    updated: '2026-08-14',
    readTime: '8 min read',
    introduction: [
      'Lithium and tubular batteries can both store energy for a solar or backup-power system, but they should not be compared by label or purchase price alone. The better choice depends on the required energy, discharge limits, charging system, installation environment, maintenance expectations and the terms attached to the specific product.',
      'This guide explains the questions to ask. It does not assign a universal lifespan, cycle count or warranty because those details vary by model, operating conditions and supplier documentation.',
    ],
    sections: [
      {
        heading: 'How the two battery types differ',
        paragraphs: [
          'Many residential lithium systems use a battery-management system to monitor and protect the cells. Tubular batteries are commonly a form of lead-acid battery designed for repeated charging and discharging. Their electrical behaviour, charging requirements, physical format and maintenance needs are not identical.',
          'The battery must be assessed as part of the complete system. An inverter or charger that supports one voltage does not automatically support every battery model, communication protocol or charging profile at that voltage.',
        ],
      },
      {
        heading: 'Usable energy matters more than the headline rating',
        paragraphs: [
          'Battery labels may show amp-hours, voltage or kilowatt-hours. To compare options, ask how much energy the chosen system is intended to make available within the manufacturer’s operating limits. The recommended depth of discharge and charge settings can affect the usable portion.',
          'System losses and high loads can also affect real backup time. A load audit remains necessary even when a battery is sold with a clear energy rating.',
        ],
      },
      {
        heading: 'Maintenance and installation environment',
        paragraphs: [
          'Maintenance requirements depend on the exact battery product. Some lead-acid installations require periodic attention and appropriate ventilation; a sealed label should not be used to assume every installation condition. Lithium batteries also need a suitable location, compatible protection and the temperature and clearance conditions stated by the manufacturer.',
          'Discuss the available floor or wall space, ventilation, access, cable length and protection devices before choosing a battery solely from an online photograph.',
        ],
      },
      {
        heading: 'Charging and inverter compatibility',
        paragraphs: [
          'Confirm nominal voltage, charging current, charge profile, maximum operating limits and any required communication between the battery and inverter. A supported communication connection can allow compatible equipment to share status and protection information, but compatibility is product-specific.',
          'If batteries will be connected in parallel or expanded later, the permitted arrangement, matching requirements and commissioning procedure should come from the relevant product documentation.',
        ],
      },
      {
        heading: 'Purchase price versus total project fit',
        paragraphs: [
          'The lowest initial battery price may not produce the lowest total system cost, and the most expensive battery is not automatically the right choice. Compare usable energy, required quantity, installation hardware, maintenance, compatibility, operating limits and confirmed warranty terms.',
          'Ask for a written quotation that identifies the battery model and quantity. This makes it easier to compare systems that use different battery formats or capacities.',
        ],
      },
      {
        heading: 'Questions to ask before choosing',
        bullets: [
          'What exact battery model and quantity are included?',
          'What usable-energy assumption is being used for the proposed load?',
          'Is the battery confirmed compatible with the selected inverter or charger?',
          'What installation, ventilation, protection and clearance requirements apply?',
          'What maintenance is required for this specific model?',
          'What warranty terms will be stated for this product and project?',
          'Can the system be expanded later, and under what product-specific conditions?',
        ],
      },
    ],
    takeaway: 'Choose between lithium and tubular batteries by comparing the complete design: required usable energy, charging compatibility, installation conditions, maintenance, expansion rules and written product terms. Avoid relying on a universal lifespan or backup-time promise.',
    relatedLinks: [
      { href: '/solar-products#solar-batteries', label: 'Browse listed solar batteries' },
      { href: '/packages', label: 'Compare lithium and tubular package starting points' },
      { href: '/warranty', label: 'Read the warranty information page' },
    ],
  },
  {
    slug: 'solar-installation-cost-ibadan',
    title: 'Solar Installation Cost in Ibadan: What Affects Your Quote?',
    shortTitle: 'What affects solar installation cost in Ibadan?',
    description: 'Understand the load, battery, panel, inverter and site factors that affect a solar installation quotation in Ibadan—without relying on a one-size-fits-all price.',
    eyebrow: 'Ibadan solar planning',
    published: '2026-08-14',
    updated: '2026-08-14',
    readTime: '8 min read',
    introduction: [
      'There is no single reliable price for every solar installation in Ibadan. A quotation depends on what the system must power, how long it should provide energy, the selected equipment and the work required at the property.',
      'Published package prices can be useful starting points, but a final project quotation should identify the equipment, quantities, installation scope, delivery and site-specific work. That is more useful than comparing headline prices that may describe different systems.',
    ],
    sections: [
      {
        heading: '1. The appliance load and operating pattern',
        paragraphs: [
          'A system for lighting, fans, television and internet equipment is different from one expected to support air conditioning, pumps, freezers, office equipment or electric cooking. Daily operating hours and simultaneous use affect the design as much as the appliance list.',
          'Prepare an essential-load list and a second list of optional loads. This lets the quotation show what the proposed system is actually intended to support.',
        ],
      },
      {
        heading: '2. Required backup time and battery storage',
        paragraphs: [
          'The desired backup period influences battery storage. Overnight support, short outage support and broad daily energy use are different design goals. Battery chemistry, product limits, quantity and compatibility also affect the equipment and installation scope.',
          'A quotation should identify the battery model and quantity rather than promise a universal number of backup hours without reference to the proposed load.',
        ],
      },
      {
        heading: '3. Inverter capacity and starting demand',
        paragraphs: [
          'The inverter must support the intended simultaneous load and the starting behaviour of relevant motors and compressors. Voltage arrangement, charging capability, solar input limits and battery compatibility are also part of the selection.',
          'Two quotations that mention the same inverter size may still differ in battery storage, solar input, protective equipment and installation work.',
        ],
      },
      {
        heading: '4. Solar panels, mounting area and shading',
        paragraphs: [
          'Panel quantity and model are only part of the solar-array cost. The available roof or ground area, orientation, shading, mounting structure, cable route and access can affect the design and labour. A site assessment can reveal issues that are not visible in a package name.',
          'The selected panels must also operate within the relevant inverter or charge-controller input limits.',
        ],
      },
      {
        heading: '5. Electrical and installation scope',
        paragraphs: [
          'A project may require distribution-board work, changeover arrangements, protective devices, earthing, longer cable routes or preparation of the equipment location. The necessary work depends on the property and agreed design.',
          'Ask the written quote to separate or clearly identify equipment, installation and any assumptions. If the scope changes, the price and timing may need to be revised.',
        ],
      },
      {
        heading: '6. Delivery, access and project timing',
        paragraphs: [
          'Leaf Solar provides free delivery within Ibadan for store orders; destinations outside Ibadan require an approved delivery quotation before online payment. Solar-project logistics and work timing should be confirmed for the specific property and scope.',
          'Safe access, equipment location and any third-party work should be discussed before installation is scheduled.',
        ],
      },
      {
        heading: 'How to compare solar quotations fairly',
        bullets: [
          'Compare exact equipment models and quantities, not package labels alone.',
          'Check which appliances and operating assumptions the design covers.',
          'Confirm whether mounting, cables, protection, distribution work and delivery are included.',
          'Ask for product-specific warranty and workmanship terms in writing.',
          'Confirm whether a site assessment or photographs are still required.',
          'Treat calculator results as estimates until the final design is confirmed.',
        ],
      },
    ],
    takeaway: 'A useful Ibadan solar quotation connects price to a defined load, battery requirement, solar array, inverter selection and site scope. Compare written details rather than assuming two similarly named packages include the same equipment or work.',
    relatedLinks: [
      { href: '/solar-installation-ibadan', label: 'See the Ibadan installation process' },
      { href: '/solar-calculator', label: 'Prepare an indicative load estimate' },
      { href: '/contact', label: 'Request a project quotation' },
    ],
  },
  {
    slug: 'what-can-solar-system-power',
    title: 'What Can a Solar System Power? A Practical Load Guide',
    shortTitle: 'What can a solar system power?',
    description: 'Learn how appliance watts, running hours, simultaneous use, starting surge and battery storage determine what a solar system can power.',
    eyebrow: 'Appliance load guide',
    published: '2026-08-14',
    updated: '2026-08-14',
    readTime: '7 min read',
    introduction: [
      'A solar system cannot be described accurately only by saying it powers a house, office or shop. What it can run depends on the actual appliances, how long they operate, which ones run together, and the capacity and operating limits of the selected inverter, battery and solar array.',
      'The practical way to answer the question is to build a load plan. This guide shows how to organise one without making unsupported backup-time promises.',
    ],
    sections: [
      {
        heading: 'Start with essential, useful and optional loads',
        paragraphs: [
          'Divide appliances into three groups. Essential loads are the devices you need during an outage. Useful loads improve comfort or productivity but can be managed. Optional high-demand loads may only be used when solar production or battery conditions permit.',
          'This priority list helps you avoid designing around every appliance running at once when that is not how you intend to use the system.',
        ],
        bullets: [
          'Essential: selected lights, fans, internet equipment, security devices or refrigeration as applicable.',
          'Useful: television, computers, additional fans or other routine appliances.',
          'Optional high demand: air conditioners, pumps, irons, kettles, heaters and electric cooking appliances.',
        ],
      },
      {
        heading: 'Check running watts and daily hours',
        paragraphs: [
          'Use the rating on each appliance where available. Multiply watts by quantity and daily hours to estimate energy use. Appliances that cycle, such as refrigerators and some air conditioners, do not necessarily draw their full rated power continuously, but their real pattern should not be replaced with an unsupported universal assumption.',
          'If an appliance has several modes, record the mode you expect to use. Energy-saving settings and usage habits can change the daily total.',
        ],
      },
      {
        heading: 'Identify appliances that run together',
        paragraphs: [
          'Daily energy tells you about storage and replenishment, while simultaneous demand helps determine inverter capacity. A system may have enough daily energy for several appliances but still be overloaded if too many high-demand devices start together.',
          'Write a realistic “busy period” list—for example, the appliances likely to be on during an evening or business peak—and discuss it during system sizing.',
        ],
      },
      {
        heading: 'Allow for motors and compressors',
        paragraphs: [
          'Refrigerators, freezers, pumps and air conditioners can need extra starting power. The actual requirement depends on the appliance design and operating conditions. Check the relevant equipment information and the inverter’s product-specific surge capability.',
          'Do not assume that the word “inverter” on an appliance removes the need to check starting and operating demand.',
        ],
      },
      {
        heading: 'Connect the load plan to battery and panels',
        paragraphs: [
          'Battery storage must support the intended energy use within the battery’s operating limits. Solar panels must then replenish energy while staying within the solar-input limits of the equipment. Weather, shade, temperature and losses mean panel nameplate power is not a promise of constant output.',
          'If you want overnight operation, make that explicit. If high-demand appliances will only run during strong daytime solar, include that operating plan in the assessment.',
        ],
      },
      {
        heading: 'Use a calculator as a planning tool',
        paragraphs: [
          'An online calculator is useful for collecting appliances and testing scenarios. Try one estimate for essentials and another that includes optional loads. This shows which devices are driving the requirement.',
          'Calculator outputs remain indicative. Final sizing should use actual ratings, confirmed equipment specifications and site information.',
        ],
      },
    ],
    takeaway: 'What a solar system can power is determined by a specific load plan. Record appliance ratings, hours, simultaneous use and starting demand, then connect that information to confirmed inverter, battery and panel limits.',
    relatedLinks: [
      { href: '/solar-calculator', label: 'Build your appliance load estimate' },
      { href: '/blog/how-to-size-solar-system-nigeria', label: 'Read the full system-sizing guide' },
      { href: '/packages', label: 'View package starting points' },
    ],
  },
  {
    slug: 'solar-panels-inverters-batteries-explained',
    title: 'Solar Panels, Inverters and Batteries: How They Work Together',
    shortTitle: 'How solar panels, inverters and batteries work together',
    description: 'Understand the roles of solar panels, inverters, batteries, mounting, protection and household circuits in a complete solar power system.',
    eyebrow: 'Solar system basics',
    published: '2026-08-14',
    updated: '2026-08-14',
    readTime: '8 min read',
    introduction: [
      'A solar installation is a system, not a collection of unrelated product sizes. Panels produce electricity, batteries store energy, and the inverter manages power conversion and system operation. Mounting, cables, protection, earthing and the connection to selected household circuits are also part of a safe and usable design.',
      'Understanding each role makes it easier to compare quotations and ask why particular equipment has been proposed.',
    ],
    sections: [
      {
        heading: 'Solar panels: producing energy from daylight',
        paragraphs: [
          'Photovoltaic panels produce direct-current electricity when exposed to light. Their nameplate power is measured under defined test conditions; actual output changes with sunlight, temperature, orientation, shading, dirt and system losses.',
          'Panel quantity should be selected alongside the inverter or charge controller’s permitted voltage, current and power ranges. Available mounting area and shade can influence the final array layout.',
        ],
      },
      {
        heading: 'The inverter: converting and managing power',
        paragraphs: [
          'The inverter supplies alternating-current power for compatible household or business loads. Depending on the model and design, it may also manage solar input, battery charging, grid or generator input and operating priorities.',
          'Important questions include continuous output, product-specific surge capability, solar-input limits, charging limits, system voltage and confirmed battery compatibility. The inverter name alone does not describe the total energy available.',
        ],
      },
      {
        heading: 'The battery: storing energy for later use',
        paragraphs: [
          'Batteries store energy for periods when loads exceed current solar production or when solar production is unavailable. The useful operating estimate depends on battery capacity, manufacturer limits, system settings, efficiency, load and battery condition.',
          'Battery chemistry and model affect charging, protection, installation and maintenance requirements. Confirm the proposed model, quantity and compatibility in the written design.',
        ],
      },
      {
        heading: 'Mounting, cables and protective equipment',
        paragraphs: [
          'Panels require a mounting arrangement suitable for the agreed location. Cables, isolators, over-current protection, surge protection, earthing and distribution work should be selected for the particular design and site.',
          'Longer cable routes, difficult access or changes to the distribution board can alter the installation scope. These items should not be treated as invisible extras when comparing quotations.',
        ],
      },
      {
        heading: 'How energy moves through the system',
        paragraphs: [
          'During solar-production periods, available panel energy can serve loads and charge the battery according to the equipment settings. When production is lower than demand, the battery or another configured source may support the loads. The exact priority depends on the inverter, system settings and available sources.',
          'A well-defined operating plan explains which loads are connected, when battery energy should be preserved, and what happens when operating limits are reached.',
        ],
      },
      {
        heading: 'Why component matching matters',
        bullets: [
          'Panel strings must remain within the relevant solar-input limits.',
          'Battery voltage, charging and communication requirements must match supported equipment.',
          'The inverter must support realistic simultaneous and starting demand.',
          'Cables and protection must suit the design and installation conditions.',
          'The battery and solar array must be assessed against daily energy needs.',
          'Site conditions and future expansion plans should be discussed before installation.',
        ],
      },
    ],
    takeaway: 'Panels, inverters and batteries must be selected as one coordinated system. Compare a proposal by checking energy needs, electrical compatibility, operating limits, protection and the complete installation scope—not by focusing on one headline component.',
    relatedLinks: [
      { href: '/solar-products', label: 'Browse solar equipment' },
      { href: '/solar-installation-ibadan', label: 'Plan an Ibadan solar installation' },
      { href: '/contact', label: 'Ask about a project quotation' },
    ],
  },
];

export function getSolarGuide(slug: string) {
  return solarGuides.find(guide => guide.slug === slug);
}
