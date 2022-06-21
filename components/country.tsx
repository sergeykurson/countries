import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const COUNTRY_INFO_HOST = "https://restcountries.com/v3.1";
const COUNTRY_INFO_BASIC_FIELDS = "fields=cca3,name,capital,population,flags";
const COUNTRY_INFO_ADVANCED_FIELDS = COUNTRY_INFO_BASIC_FIELDS + ",currencies,languages,borders,region,subregion";

export const getAllCountries = async (): Promise<Array<CountryInfoBasic>> => {
  const response = await fetch(`${COUNTRY_INFO_HOST}/all?${COUNTRY_INFO_BASIC_FIELDS}`);
  if (response.ok) {
    return await response.json();
  }

  throw new Error();
};

export interface CountryInfoBasic {
  cca3: string;
  name: {
    common: string;
    official: string;
  };
  capital: Array<string>;
  population: number;
  flags: {
    svg: string;
  };
}

export interface CountryInfoAdvanced extends CountryInfoBasic {
  currencies: {
    [key in string]: {
      name: string;
      symbol: string;
    }
  };
  languages: {
    [key in string]: string;
  };
  borders: Array<string>;
  region: string;
  subregion: string;
}

const CountryInfoCommon = ({ country }: { country: CountryInfoBasic }) => {
  return (
    <>
      <p data-testid="country-name" className="text-lg font-bold">{country.name.common}</p>
      {country.name.official !== country.name.common && <p className="italic">{country.name.official}</p>}
      <p>Capital: {country.capital.length > 0 ? country.capital[0] : "-"}</p>
      <p>Population: {Intl.NumberFormat().format(country.population)}</p>
    </>
  );
};

export const CountryOverview = ({ country }: { country: CountryInfoBasic }) => {
  return (
    <Link href={`/?country=${encodeURIComponent(country.name.common.toLowerCase())}`}>
      <a className="block shadow-md rounded-md bg-purple-100 hover:ring hover:ring-purple-200 focus:outline-none focus:ring focus:ring-purple-300">
        <div className="relative flex flex-row p-2 rounded-md overflow-hidden">
          <div className="relative w-32 h-32">
            <Image src={country.flags.svg} alt={country.name.common} layout="fill" objectFit="contain" />
          </div>
          <div data-testid="country-info" className="relative flex flex-col flex-1 justify-center ml-2">
            <CountryInfoCommon country={country} />
          </div>
        </div>
      </a>
    </Link>
  );
};

export const CountriesGrid = ({ countries }: { countries?: Array<CountryInfoBasic> }) => {
  return (
    <div data-testid="countries-grid" className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {countries && countries.map((country) => (
        <CountryOverview key={country.cca3} country={country} />
      ))}
    </div>
  );
};

export const CountryDetails = ({ countryName, countries }: { countryName: string; countries: Array<CountryInfoBasic> }) => {
  const [country, setCountry] = useState<CountryInfoAdvanced>();
  const [bordering, setBordering] = useState<Array<CountryInfoBasic>>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${COUNTRY_INFO_HOST}/name/${countryName}?fullText=true&${COUNTRY_INFO_ADVANCED_FIELDS}`)
      .then(async (res) => {
        if (res.ok) {
          const countryDetailsArray = await res.json();
          const countryDetails: CountryInfoAdvanced = countryDetailsArray[0];
          setBordering(countries.reduce((bordering: Array<CountryInfoBasic>, country: CountryInfoBasic) => {
            const index = countryDetails.borders.indexOf(country.cca3);
            if (index >= 0) {
              bordering[index] = country;
            }

            return bordering;
          }, []));

          setCountry(countryDetails);
        } else {
          if (res.status === 404) {
            setError("Requested country doesn't exist");
          } else {
            throw new Error(res.statusText);
          }
        }
      })
      .catch(() => setError("Sorry, we couldn't complete your request. Please try again in a moment"));
  }, [countries, countryName]);

  if (!country) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center">
        <p className="text-2xl">{error ?? "Loading..."}</p>
      </div>
    );
  }

  const currencies = Object.entries(country.currencies);
  const languages = Object.values(country.languages);

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative flex flex-col lg:flex-row items-center p-2 space-y-2 overflow-hidden shadow-md rounded-md bg-purple-100">
        <div className="relative w-full lg:w-96 h-64">
          <Image src={country.flags.svg} alt={country.name.common} layout="fill" objectFit="contain" />
        </div>
        <div data-testid="country-details" className="relative w-full flex flex-col flex-1 ml-2">
          <CountryInfoCommon country={country} />
          <p>{currencies.length > 1 ? "Currencies" : "Currency"}: {currencies.length > 0 ? currencies.map(([code, { name, symbol }]) => `${code} (${name}, ${symbol})`).join(", ") : "-"}</p>
          <p>{languages.length > 1 ? "Languages" : "Language"}: {languages.length > 0 ? languages.join(", ") : "-"}</p>
          <p>Region: {country.region.length > 0 ? country.region : "-"}</p>
          <p>Subregion: {country.subregion.length > 0 ? country.subregion : "-"}</p>
          {bordering.length <= 0 && <p>Bordering countries: -</p>}
        </div>
      </div>
      {bordering.length > 0 && (
        <>
          <p className="w-full text-center font-bold text-xl">Bordering countries:</p>
          <CountriesGrid countries={bordering} />
        </>
      )}
    </div>
  );
};
