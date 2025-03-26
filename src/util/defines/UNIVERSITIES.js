export const UNIVERSITIES_BY_CITY = [
  {
    label: "Amsterdam",
    code: "amsterdam",
    items: [
      { label: "University of Amsterdam", value: "University of Amsterdam" },
      { label: "VU Amsterdam", value: "VU Amsterdam" },
      {
        label: "Amsterdam University of Applied Sciences",
        value: "Amsterdam University of Applied Sciences",
      },
      {
        label: "Inholland University of Applied Sciences",
        value: "Inholland University of Applied Sciences",
      },
    ],
  },
  {
    label: "Breda",
    code: "breda",
    items: [
      {
        label: "Breda University of Applied Sciences",
        value: "Breda University of Applied Sciences",
      },
      { label: "Avans Hogeschool", value: "Avans Hogeschool" },
    ],
  },
  {
    label: "Eindhoven",
    code: "eindhoven",
    items: [
      {
        label: "Eindhoven University of Technology",
        value: "Eindhoven University of Technology",
      },
      { label: "Fontys", value: "Fontys" },
    ],
  },
  {
    label: "Groningen",
    code: "groningen",
    items: [
      { label: "University of Groningen", value: "University of Groningen" },
      {
        label: "Hanzehogeschool Groningen",
        value: "Hanzehogeschool Groningen",
      },
    ],
  },
  {
    label: "Leeuwarden",
    code: "leeuwarden",
    items: [{ label: "NHL Stenden", value: "NHL Stenden" }],
  },
  {
    label: "Maastricht",
    code: "maastricht",
    items: [{ label: "Maastricht University", value: "Maastricht University" }],
  },
  {
    label: "Rotterdam",
    code: "rotterdam",
    items: [
      {
        label: "Erasmus University Rotterdam",
        value: "Erasmus University Rotterdam",
      },
      { label: "Hogeschool Rotterdam", value: "Hogeschool Rotterdam" },
    ],
  },
  {
    label: "The Hague",
    code: "hague",
    items: [
      {
        label: "The Hague University of Applied Sciences",
        value: "The Hague University of Applied Sciences",
      },
      {
        label: "Inholland University of Applied Sciences",
        value: "Inholland University of Applied Sciences",
      },
    ],
  },
  {
    label: "Others",
    code: "others",
    items: [
      {
        label: "Delft University of Technology",
        value: "Delft University of Technology",
      },
      { label: "Saxion", value: "Saxion" },
      { label: "Wageningen University", value: "Wageningen University" },
      { label: "Utrecht University", value: "Utrecht University" },
      { label: "Leiden University", value: "Leiden University" },
      { label: "Tilburg University", value: "Tilburg University" },
      {
        label: "HZ University of Applied Sciences",
        value: "HZ University of Applied Sciences",
      },
      { label: "Hogeschool Utrecht", value: "Hogeschool Utrecht" },
      { label: "Windesheim", value: "Windesheim" },
      {
        label: "ArtEZ University of the Arts",
        value: "ArtEZ University of the Arts",
      },
      {
        label: "Nyenrode Business Universiteit",
        value: "Nyenrode Business Universiteit",
      },
      {
        label: "University College Utrecht",
        value: "University College Utrecht",
      },
      {
        label: "HAN University of Applied Sciences",
        value: "HAN University of Applied Sciences",
      },
      {
        label: "Rotterdam Business School",
        value: "Rotterdam Business School",
      },
      { label: "Hogeschool van Amsterdam", value: "Hogeschool van Amsterdam" },
      { label: "Other university", value: "other" },
    ],
  },
];

export function reorderUniversitiesByCode(universities, code) {
  const matchingUniversity = universities.find((uni) => uni.code === code);
  const remainingUniversities = universities.filter((uni) => uni.code !== code);

  return matchingUniversity
    ? [matchingUniversity, ...remainingUniversities]
    : universities;
}
