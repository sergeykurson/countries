import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";

import Layout from "../components/layout";
import Home from "../pages";
import { countriesInfo, countryDetails } from "./constants";

// eslint-disable-next-line jest/prefer-spy-on
global.fetch = jest.fn()
  .mockResolvedValue({ ok: true, json: () => Promise.resolve(countriesInfo) })
  .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(countryDetails) });

jest.spyOn(require("next/router"), "useRouter").mockReturnValue({
  query: { country: "netherlands" },
  prefetch: jest.fn(() => Promise.resolve()),
});

describe("country details", () => {
  it("render all the information", async () => {
    expect.assertions(25);

    await act(async () => {
      await waitFor(() => render(<Layout><Home countriesStale={countriesInfo} /></Layout>));
    });

    const countryDetails = screen.getByTestId("country-details");
    const countryDetailsChildren = countryDetails.getElementsByTagName("p");
    expect(countryDetailsChildren).toHaveLength(8);
    expect(countryDetailsChildren[0].textContent).toBe("Netherlands");
    expect(countryDetailsChildren[1].textContent).toBe("Kingdom of the Netherlands");
    expect(countryDetailsChildren[2].textContent).toBe("Capital: Amsterdam");
    expect(countryDetailsChildren[3].textContent).toBe("Population: 16,655,799");
    expect(countryDetailsChildren[4].textContent).toBe("Currency: EUR (Euro, €)");
    expect(countryDetailsChildren[5].textContent).toBe("Language: Dutch");
    expect(countryDetailsChildren[6].textContent).toBe("Region: Europe");
    expect(countryDetailsChildren[7].textContent).toBe("Subregion: Western Europe");

    const countriesGrid = screen.getByTestId("countries-grid");
    expect(countriesGrid).toBeInTheDocument();
    expect(countriesGrid.children).toHaveLength(2);

    const checkBorderingCountry = (index: number) => {
      const borderingCountriesNames = ["Belgium", "Germany"];
      const borderingCountryContainer = countriesGrid.children[index].querySelector("[data-testid=\"country-info\"]");
      expect(borderingCountryContainer).not.toBeNull();

      const borderingCountryContainerChildren = borderingCountryContainer!.children;
      const borderingCountryInfo = countriesInfo.find((c) => c.name.common === borderingCountriesNames[index])!;
      expect(borderingCountryInfo).toBeDefined();
      expect(borderingCountryContainerChildren).toHaveLength(4);
      expect(borderingCountryContainerChildren[0].textContent).toBe(borderingCountryInfo.name.common);
      expect(borderingCountryContainerChildren[1].textContent).toBe(borderingCountryInfo.name.official);
      expect(borderingCountryContainerChildren[2].textContent).toBe("Capital: " + borderingCountryInfo.capital);
      expect(borderingCountryContainerChildren[3].textContent).toBe("Population: " + Intl.NumberFormat().format(borderingCountryInfo.population));
    };

    checkBorderingCountry(0);
    checkBorderingCountry(1);
  });
});
