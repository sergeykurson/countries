import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import Layout from "../components/layout";
import Home from "../pages/index";

const useRouter = jest.spyOn(require("next/router"), "useRouter");

describe("home", () => {
  it("renders a heading", async () => {
    expect.assertions(1);

    // eslint-disable-next-line jest/prefer-spy-on
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    useRouter.mockImplementation(() => ({
      query: {},
      prefetch: jest.fn(() => Promise.resolve()),
    }));

    await act(async () => {
      await waitFor(() => render(<Layout><Home countriesStale={[]} /></Layout>));
    });

    const headingLink = screen.getByRole("link", {
      name: "Fun with Countries",
    });

    expect(headingLink).toBeInTheDocument();
  });
});
