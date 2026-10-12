export type Profession = {
  slug: string;
  label: string;
  singular: string;
  /** Typical job title used in the page examples. */
  role: string;
  /** A duty written the way a first draft tends to phrase it. */
  duty: string;
  /** The same duty in natural professional English. Same facts, same numbers. */
  dutyNatural: string;
};

export const PROFESSIONS: Profession[] = [
  {
    slug: "nurses",
    label: "Nurses",
    singular: "a nurse",
    role: "Registered Nurse",
    duty: "the coordination of the care of 24 patients per shift",
    dutyNatural: "coordinated care for 24 patients a shift",
  },
  {
    slug: "software-engineers",
    label: "Software Engineers",
    singular: "a software engineer",
    role: "Software Engineer",
    duty: "the development of the API that serves 2 million requests per day",
    dutyNatural: "built the API that serves 2 million requests a day",
  },
  {
    slug: "teachers",
    label: "Teachers",
    singular: "a teacher",
    role: "Secondary School Teacher",
    duty: "the preparation of the lessons of math for 5 classes",
    dutyNatural: "planned math lessons for 5 classes",
  },
  {
    slug: "accountants",
    label: "Accountants",
    singular: "an accountant",
    role: "Accountant",
    duty: "the elaboration of the monthly closing of 3 subsidiaries",
    dutyNatural: "closed the monthly books for 3 subsidiaries",
  },
  {
    slug: "marketing-professionals",
    label: "Marketing Professionals",
    singular: "a marketing professional",
    role: "Marketing Manager",
    duty: "the management of the campaigns of paid media with a budget of $40,000 per month",
    dutyNatural: "managed paid media campaigns on a $40,000 monthly budget",
  },
  {
    slug: "customer-service-representatives",
    label: "Customer Service Representatives",
    singular: "a customer service representative",
    role: "Customer Service Representative",
    duty: "the attendance of 80 tickets per day with satisfaction of 95%",
    dutyNatural: "handled 80 tickets a day at 95% satisfaction",
  },
  {
    slug: "sales-representatives",
    label: "Sales Representatives",
    singular: "a sales representative",
    role: "Sales Representative",
    duty: "the achievement of 120% of the goal of sales during 6 quarters",
    dutyNatural: "hit 120% of quota for 6 quarters",
  },
  {
    slug: "project-managers",
    label: "Project Managers",
    singular: "a project manager",
    role: "Project Manager",
    duty: "the conduction of 4 simultaneous projects with teams of 12 people",
    dutyNatural: "ran 4 concurrent projects with teams of 12 people",
  },
  {
    slug: "data-analysts",
    label: "Data Analysts",
    singular: "a data analyst",
    role: "Data Analyst",
    duty: "the construction of the dashboards of follow-up of the KPIs of the company",
    dutyNatural: "built the dashboards that track company KPIs",
  },
  {
    slug: "graphic-designers",
    label: "Graphic Designers",
    singular: "a graphic designer",
    role: "Graphic Designer",
    duty: "the creation of the visual identity of 15 brands",
    dutyNatural: "created the visual identity for 15 brands",
  },
  {
    slug: "administrative-assistants",
    label: "Administrative Assistants",
    singular: "an administrative assistant",
    role: "Administrative Assistant",
    duty: "the organization of the agenda of 3 directors",
    dutyNatural: "managed the calendars of 3 directors",
  },
  {
    slug: "mechanical-engineers",
    label: "Mechanical Engineers",
    singular: "a mechanical engineer",
    role: "Mechanical Engineer",
    duty: "the realization of the project of the cooling system of 2 industrial lines",
    dutyNatural: "designed the cooling system for 2 industrial lines",
  },
  {
    slug: "physicians",
    label: "Physicians",
    singular: "a physician",
    role: "Physician",
    duty: "the attendance of 30 patients per day in the emergency",
    dutyNatural: "treated 30 patients a day in the emergency department",
  },
  {
    slug: "pharmacists",
    label: "Pharmacists",
    singular: "a pharmacist",
    role: "Pharmacist",
    duty: "the control of the stock of medicines of 2 pharmacies",
    dutyNatural: "managed medication inventory for 2 pharmacies",
  },
  {
    slug: "physical-therapists",
    label: "Physical Therapists",
    singular: "a physical therapist",
    role: "Physical Therapist",
    duty: "the treatment of 15 patients of rehabilitation per day",
    dutyNatural: "treated 15 rehabilitation patients a day",
  },
  {
    slug: "human-resources-professionals",
    label: "Human Resources Professionals",
    singular: "a human resources professional",
    role: "HR Generalist",
    duty: "the realization of the recruitment of 60 positions per year",
    dutyNatural: "recruited for 60 roles a year",
  },
  {
    slug: "financial-analysts",
    label: "Financial Analysts",
    singular: "a financial analyst",
    role: "Financial Analyst",
    duty: "the elaboration of the forecast of a portfolio of $25 million",
    dutyNatural: "produced the forecast for a $25 million portfolio",
  },
  {
    slug: "truck-drivers",
    label: "Truck Drivers",
    singular: "a truck driver",
    role: "Truck Driver",
    duty: "the realization of deliveries of 500 km per day without accidents during 6 years",
    dutyNatural: "drove 500 km of deliveries a day without accidents for 6 years",
  },
  {
    slug: "caregivers",
    label: "Caregivers",
    singular: "a caregiver",
    role: "Caregiver",
    duty: "the care of 3 elderly persons with reduced mobility",
    dutyNatural: "cared for 3 older adults with limited mobility",
  },
  {
    slug: "chefs",
    label: "Chefs",
    singular: "a chef",
    role: "Chef",
    duty: "the command of a kitchen of 12 cooks for 200 covers per night",
    dutyNatural: "led a 12-cook kitchen serving 200 covers a night",
  },
  {
    slug: "welders",
    label: "Welders",
    singular: "a welder",
    role: "Welder",
    duty: "the execution of welds TIG in structures of stainless steel",
    dutyNatural: "performed TIG welds on stainless steel structures",
  },
  {
    slug: "electricians",
    label: "Electricians",
    singular: "an electrician",
    role: "Electrician",
    duty: "the installation of panels electrical in 40 residences",
    dutyNatural: "installed electrical panels in 40 homes",
  },
];

export function findProfession(slug: string): Profession | undefined {
  return PROFESSIONS.find((p) => p.slug === slug);
}
