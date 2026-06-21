export type Course = {
  id: string;
  name: string;
  university: string;
  city: string;
  area: "Saúde" | "Engenharia" | "Direito" | "Economia" | "Ciências" | "Artes" | "Humanidades";
  degree: "Licenciatura" | "Mestrado Integrado";
  vacancies: number;
  // Nota do último colocado (1ª fase) — 0 a 200
  lastGrade: number;
  // Tendência das médias dos últimos 3 anos
  history: { year: string; grade: number }[];
};

export const AREAS: Course["area"][] = [
  "Saúde",
  "Engenharia",
  "Direito",
  "Economia",
  "Ciências",
  "Artes",
  "Humanidades",
];

export const COURSES: Course[] = [
  {
    id: "med-ulisboa",
    name: "Medicina",
    university: "Universidade de Lisboa",
    city: "Lisboa",
    area: "Saúde",
    degree: "Mestrado Integrado",
    vacancies: 343,
    lastGrade: 189.5,
    history: [
      { year: "2022", grade: 188.2 },
      { year: "2023", grade: 188.9 },
      { year: "2024", grade: 189.5 },
    ],
  },
  {
    id: "med-porto",
    name: "Medicina",
    university: "Universidade do Porto",
    city: "Porto",
    area: "Saúde",
    degree: "Mestrado Integrado",
    vacancies: 320,
    lastGrade: 190.1,
    history: [
      { year: "2022", grade: 189.0 },
      { year: "2023", grade: 189.6 },
      { year: "2024", grade: 190.1 },
    ],
  },
  {
    id: "eng-info-ist",
    name: "Engenharia Informática e de Computadores",
    university: "Instituto Superior Técnico",
    city: "Lisboa",
    area: "Engenharia",
    degree: "Licenciatura",
    vacancies: 280,
    lastGrade: 178.4,
    history: [
      { year: "2022", grade: 174.0 },
      { year: "2023", grade: 176.2 },
      { year: "2024", grade: 178.4 },
    ],
  },
  {
    id: "eng-aero-ist",
    name: "Engenharia Aeroespacial",
    university: "Instituto Superior Técnico",
    city: "Lisboa",
    area: "Engenharia",
    degree: "Mestrado Integrado",
    vacancies: 95,
    lastGrade: 182.7,
    history: [
      { year: "2022", grade: 180.3 },
      { year: "2023", grade: 181.5 },
      { year: "2024", grade: 182.7 },
    ],
  },
  {
    id: "direito-ulisboa",
    name: "Direito",
    university: "Universidade de Lisboa",
    city: "Lisboa",
    area: "Direito",
    degree: "Licenciatura",
    vacancies: 410,
    lastGrade: 164.8,
    history: [
      { year: "2022", grade: 162.1 },
      { year: "2023", grade: 163.4 },
      { year: "2024", grade: 164.8 },
    ],
  },
  {
    id: "gestao-nova",
    name: "Gestão",
    university: "Nova SBE",
    city: "Lisboa",
    area: "Economia",
    degree: "Licenciatura",
    vacancies: 230,
    lastGrade: 171.2,
    history: [
      { year: "2022", grade: 168.5 },
      { year: "2023", grade: 169.9 },
      { year: "2024", grade: 171.2 },
    ],
  },
  {
    id: "economia-porto",
    name: "Economia",
    university: "Universidade do Porto",
    city: "Porto",
    area: "Economia",
    degree: "Licenciatura",
    vacancies: 290,
    lastGrade: 158.3,
    history: [
      { year: "2022", grade: 155.0 },
      { year: "2023", grade: 156.8 },
      { year: "2024", grade: 158.3 },
    ],
  },
  {
    id: "psicologia-coimbra",
    name: "Psicologia",
    university: "Universidade de Coimbra",
    city: "Coimbra",
    area: "Saúde",
    degree: "Licenciatura",
    vacancies: 180,
    lastGrade: 160.4,
    history: [
      { year: "2022", grade: 157.2 },
      { year: "2023", grade: 158.9 },
      { year: "2024", grade: 160.4 },
    ],
  },
  {
    id: "arquitetura-porto",
    name: "Arquitetura",
    university: "Universidade do Porto",
    city: "Porto",
    area: "Artes",
    degree: "Mestrado Integrado",
    vacancies: 110,
    lastGrade: 166.9,
    history: [
      { year: "2022", grade: 164.0 },
      { year: "2023", grade: 165.5 },
      { year: "2024", grade: 166.9 },
    ],
  },
  {
    id: "biologia-coimbra",
    name: "Biologia",
    university: "Universidade de Coimbra",
    city: "Coimbra",
    area: "Ciências",
    degree: "Licenciatura",
    vacancies: 150,
    lastGrade: 148.6,
    history: [
      { year: "2022", grade: 145.1 },
      { year: "2023", grade: 146.8 },
      { year: "2024", grade: 148.6 },
    ],
  },
  {
    id: "relacoes-int-minho",
    name: "Relações Internacionais",
    university: "Universidade do Minho",
    city: "Braga",
    area: "Humanidades",
    degree: "Licenciatura",
    vacancies: 120,
    lastGrade: 152.0,
    history: [
      { year: "2022", grade: 149.4 },
      { year: "2023", grade: 150.7 },
      { year: "2024", grade: 152.0 },
    ],
  },
  {
    id: "design-aveiro",
    name: "Design",
    university: "Universidade de Aveiro",
    city: "Aveiro",
    area: "Artes",
    degree: "Licenciatura",
    vacancies: 90,
    lastGrade: 144.3,
    history: [
      { year: "2022", grade: 141.0 },
      { year: "2023", grade: 142.7 },
      { year: "2024", grade: 144.3 },
    ],
  },
];
