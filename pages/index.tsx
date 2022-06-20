import type { InferGetStaticPropsType, NextPage } from "next";
import type { CountryInfo } from "../components/country";

import { CountriesGrid, CountryDetailsFetch, getAllCountries } from "../components/country";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ countriesStale }) => {
  const router = useRouter();
  const countryQueryParam = router.query["country"];
  const [sorting, setSorting] = useState<string>("none");
  const [search, setSearch] = useState<string>("");
  const [pages, setPages] = useState<number>(1);
  const [countriesProcessed, countriesAll] = useCountries(countriesStale, sorting, search);
  const countriesToShow = countriesProcessed.slice(0, 18 * pages);

  if (typeof countryQueryParam === "string" && countryQueryParam.length > 0) {
    return (
      <>
        <Link href="/">
          <a className="flex w-32 h-10 mb-4 rounded font-medium items-center justify-center bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white focus:outline-none focus:ring focus:ring-purple-400">
            ← Back
          </a>
        </Link>
        <CountryDetailsFetch key={countryQueryParam} countryName={countryQueryParam} countries={countriesAll} />
      </>
    );
  }

  const handleSorting = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setSorting(ev.target.value);
  };

  const handleSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(ev.target.value);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between w-full py-3 space-y-3 md:space-y-0">
        <div className="flex flex-col sm:flex-row space-x-3">
          <p>Sorting:</p>
          {[
            {
              value: "none",
              label: "None",
            },
            {
              value: "asc",
              label: "Ascending",
            },
            {
              value: "desc",
              label: "Descending",
            },
          ].map(({ value, label }) => (
            <span key={value} className="space-x-1">
              <input type="radio" id={"sorting" + value} name="sorting" value={value} defaultChecked={sorting === value} onChange={handleSorting} />
              <label htmlFor={"sorting" + value}>{label}</label>
            </span>
          ))}
        </div>
        <div className="space-x-3">
          <label htmlFor="countrySearch">Search:</label>
          <input type="input" id="countrySearch" defaultValue={search} onChange={handleSearch} />
        </div>
      </div>
      <CountriesGrid countries={countriesToShow} />
      {countriesToShow.length < countriesProcessed.length && <div className="flex justify-center">
        <button onClick={() => setPages(page => page + 1)} className="flex w-32 h-10 mt-4 rounded font-medium items-center justify-center bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white focus:outline-none focus:ring focus:ring-purple-400">
          Show more
        </button>
      </div>}
    </>
  );
};

const useCountries = (countriesStale: Array<CountryInfo>, sorting: string, search: string) => {
  const [countries, setCountries] = useState(countriesStale);

  useEffect(() => {
    getAllCountries().then((c) => setCountries(c)).catch((e) => console.warn(e));
  }, []);

  const processedCountries = useMemo(() => {
    if (!countries) {
      return [];
    }

    const searchLower = search.toLowerCase();
    const filteredCountries = countries.filter((c) => c.name.common.toLowerCase().includes(searchLower));

    switch (sorting) {
      case "asc":
        filteredCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        break;
      case "desc":
        filteredCountries.sort((a, b) => b.name.common.localeCompare(a.name.common));
        break;
    }

    return filteredCountries;
  }, [countries, search, sorting]);

  return [processedCountries, countries];
};

export const getStaticProps = async () => {
  const countriesStale: Array<CountryInfo> = await getAllCountries().catch(() => []);

  return {
    props: {
      countriesStale,
    },
  };
};

export default Home;
