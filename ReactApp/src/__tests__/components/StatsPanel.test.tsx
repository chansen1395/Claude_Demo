import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "../../theme";
import { StatsPanel } from "../../components/StatsPanel";
import type { SimStats } from "../../engine/types";

function renderWithTheme(ui: React.ReactElement) {
	return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const mockStats: SimStats = {
	herbs: 42,
	carns: 8,
	omnis: 5,
	food: 75,
	hE: 60,
	cE: 80,
	oE: 55,
	maxGen: 12,
	bestFit: "35.2",
	time: 120,
};

describe("StatsPanel", () => {
	it("renders statistics title", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("Statistics")).toBeInTheDocument();
	});

	it("displays herbivore count", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("displays carnivore count", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("8")).toBeInTheDocument();
	});

	it("displays omnivore count", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("displays food count", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("75")).toBeInTheDocument();
	});

	it("displays best fitness", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("35.2")).toBeInTheDocument();
	});

	it("displays generation", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("12")).toBeInTheDocument();
	});

	it("displays time formatted", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("120s")).toBeInTheDocument();
	});

	it("renders all group titles", () => {
		renderWithTheme(<StatsPanel stats={mockStats} />);
		expect(screen.getByText("Herbivores")).toBeInTheDocument();
		expect(screen.getByText("Carnivores")).toBeInTheDocument();
		expect(screen.getByText("Omnivores")).toBeInTheDocument();
		expect(screen.getByText("Ecosystem")).toBeInTheDocument();
	});
});
