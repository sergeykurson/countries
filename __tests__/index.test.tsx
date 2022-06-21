import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import Layout from "../components/layout";
import Home from "../pages/index";
import { countriesInfo } from "./constants";

// eslint-disable-next-line jest/prefer-spy-on
global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(countriesInfo) });

jest.spyOn(require("next/router"), "useRouter").mockReturnValue({
  query: {},
  prefetch: jest.fn(() => Promise.resolve()),
});

const renderHome = async () => {
  await act(async () => {
    await waitFor(() => render(<Layout><Home countriesStale={countriesInfo} /></Layout>));
  });
};

describe("home", () => {
  it("renders a heading", async () => {
    expect.assertions(1);

    await renderHome();

    const headingLink = screen.getByRole("link", {
      name: "Fun with Countries",
    });

    expect(headingLink).toBeInTheDocument();
  });

  it("doesn't sort countries by default", async () => {
    expect.assertions(4);

    await renderHome();

    const sortingNone = screen.getByRole("radio", {
      name: "None",
    });

    expect(sortingNone).toBeInTheDocument();
    expect(sortingNone).toBeChecked();

    const countries = screen.getAllByTestId("country-name");
    expect(countries).toHaveLength(9);
    expect(countries[0].textContent).toBe("Ireland");
  });

  it("sorts countries in ascending order", async () => {
    expect.assertions(5);

    await renderHome();

    const sortingAsc = screen.getByRole("radio", {
      name: "Ascending",
    });

    expect(sortingAsc).toBeInTheDocument();
    expect(sortingAsc).not.toBeChecked();

    fireEvent.click(sortingAsc);

    expect(sortingAsc).toBeChecked();

    const countries = screen.getAllByTestId("country-name");
    expect(countries).toHaveLength(9);
    expect(countries[0].textContent).toBe("Belgium");
  });

  it("sorts countries in descending order", async () => {
    expect.assertions(5);

    await renderHome();

    const sortingDesc = screen.getByRole("radio", {
      name: "Descending",
    });

    expect(sortingDesc).toBeInTheDocument();
    expect(sortingDesc).not.toBeChecked();

    fireEvent.click(sortingDesc);

    expect(sortingDesc).toBeChecked();

    const countries = screen.getAllByTestId("country-name");
    expect(countries).toHaveLength(9);
    expect(countries[0].textContent).toBe("Ukraine");
  });

  it("has blank search input by default", async () => {
    expect.assertions(2);

    await renderHome();

    const searchInput = screen.getByRole("textbox", {
      name: "Search:",
    });

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  it("filters countries using search", async () => {
    expect.assertions(6);

    await renderHome();

    const countryName = "Ukraine";
    const countriesGrid = screen.getByTestId("countries-grid");
    const searchInput = screen.getByRole("textbox", {
      name: "Search:",
    });

    expect(searchInput).toBeInTheDocument();
    expect(countriesGrid).toBeInTheDocument();

    expect(searchInput).toHaveValue("");
    expect(countriesGrid.children).toHaveLength(9);

    fireEvent.change(searchInput, { target: { value: countryName } });

    expect(searchInput).toHaveValue(countryName);
    expect(countriesGrid.children).toHaveLength(1);
  });

  it("hasn't more countries to show", async () => {
    expect.assertions(1);

    await renderHome();

    const showMore = screen.queryByRole("button", {
      name: "Show more",
    });

    expect(showMore).not.toBeInTheDocument();
  });
});
