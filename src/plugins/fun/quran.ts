import { BaseCommand } from "../../common/index.js";

interface Surah {
    number: number,
    name: string,
    englishName: string,
    englishNameTranslation: string,
    numberOfAyahs: number,
    revelationType: string,
}

interface Ayah {
  text: string,
  numberInSurah: number,
}

type AyahList = Ayah[];

interface SurahResponse {
  code: number,
  status: string,
  data: {
    ayahs: AyahList,
  },
}

type SurahList = Surah[];

interface SurahsResponse {
    code: number,
    status: string,
    data: SurahList,
}

export default class Quran extends BaseCommand {
  private static surahs: SurahList = [];

  private getRandomSurah(list: SurahList) {
    return list[Math.floor(Math.random() * Quran.surahs.length)];
  }

  async run() {
    const randomSurah = this.getRandomSurah(Quran.surahs);
    if (!randomSurah) return "No surahs :(";

    const resultEn = await fetch(`http://api.alquran.cloud/v1/surah/${randomSurah.number}/en.asad`);
    const result = await fetch(`http://api.alquran.cloud/v1/surah/${randomSurah.number}`);
    const surah = await result.json() as SurahResponse;
    const surahEn = await resultEn.json() as SurahResponse;

    return `Alhamdulillah, Brother ${this.author.username}:\n${surah.data.ayahs[0]?.text.trim()}\n${surahEn.data.ayahs[0]?.text.trim()} [Surah ${randomSurah.number}:${surah.data.ayahs[0]?.numberInSurah}]`;
  }

  static async init() {
    const result = await fetch("http://api.alquran.cloud/v1/surah");
    const surah = await result.json() as SurahsResponse;

    this.surahs = surah.data;

    return this;
  }

  static description = "Gets a surah from the Quran.";
}
