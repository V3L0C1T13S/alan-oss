import { BaseCommand } from "../../common/index.js";

type iCountry = {
  name: string;
  states: string[];
}

const countries: iCountry[] = [
  {
    name: "United States",
    states: [
      "New York",
      "California",
      "Florida",
      "Texas",
      "Illinois",
      "Pennsylvania",
      "Ohio",
      "Georgia",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Indiana",
      "New Jersey",
      "Tennessee",
      "Wisconsin",
      "Washington",
      "Arizona",
    ],
  }, {
    name: "Canada",
    states: [
      "Ontario",
      "Quebec",
      "British Columbia",
      "Alberta",
      "Saskatchewan",
      "Manitoba",
      "New Brunswick",
      "Nova Scotia",
    ],
  }, {
    name: "United Kingdom",
    states: [
      "England",
      "Scotland",
      "Wales",
    ],
  }, {
    name: "Indonesia",
    states: [
      "Jawa Barat",
      "Jawa Tengah",
      "Jawa Timur",
      "Banten",
      "DKI Jakarta",
    ],
  }, {
    name: "France",
    states: [
      "Auvergne-Rhone-Alpes",
      "Bourgogne-Franche-Comte",
      "Bretagne",
      "Centre-Val de Loire",
      "Corse",
      "Grand Est",
      "Hauts-de-France",
      "Ile-de-France",
      "Normandie",
      "Nouvelle-Aquitaine",
      "Occitanie",
    ],
  }, {
    name: "Japan",
    states: [
      "Hokkaido",
      "Aomori",
      "Iwate",
      "Miyagi",
      "Akita",
      "Yamagata",
      "Fukushima",
      "Ibaraki",
      "Tochigi",
      "Gunma",
      "Saitama",
      "Chiba",
      "Tokyo",
      "Kanagawa",
      "Niigata",
    ],
  }, {
    name: "Islamic Republic of Iran",
    states: [
      "Kermanshah",
      "Tehran",
      "Chahar Mahall va Bakhtiari",
      "Kohgiluyeh va Buyer Ahmad",
      "Fars",
    ],
  },
];

export default class WhereAmI extends BaseCommand {
  private generateRandomIP(): string {
    // Generate a lazy IP address
    let ip = "";
    for (let i = 0; i < 4; i += 1) {
      ip += Math.floor(Math.random() * 256);
      if (i < 3) ip += ".";
    }
    return ip;
  }

  private fakeInfoGenerator() {
    const country = countries[Math.floor(Math.random() * countries.length)];

    return {
      country: country!.name,
      city: country!.states[Math.floor(Math.random() * country!.states.length)],
    };
  }

  async run() {
    const info = this.fakeInfoGenerator();
    return `Your IP: ${this.generateRandomIP()}
        Your location: ${info.city}, ${info.country},`;
  }

  static description = "Returns your ip address with exact location.";
}
